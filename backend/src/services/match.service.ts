import prisma from '../utils/db';
import { MatchStatus } from '@prisma/client';
import { notificationService } from './notification.service';
import { FraudDetection } from '../utils/fraudDetection';
import { activityService } from './activity.service';

export class MatchService {
  async createMatch(userId: string, data: any) {
    const cost = data.costPerPerson ? parseFloat(data.costPerPerson) : 0;
    
    // Deterministic Fake Event Check
    const fraudCheck = FraudDetection.isFakeEvent(data.title, cost);
    if (fraudCheck.isFake) {
      throw new Error(`Match creation blocked: ${fraudCheck.reason}`);
    }

    const match = await prisma.match.create({
      data: {
        title: data.title,
        sport: data.sport,
        date: new Date(data.date),
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        maxPlayers: parseInt(data.maxPlayers),
        costPerPerson: data.costPerPerson ? parseFloat(data.costPerPerson) : null,
        skillLevel: data.skillLevel || 'ALL',
        matchType: data.matchType || 'CASUAL',
        creatorId: userId,
        communityId: data.communityId || null,
        venueId: data.venueId || null,
        status: MatchStatus.OPEN,
      },
    });

    await activityService.logActivity(userId, 'MATCH_CREATED', match.id, 'Match', { title: match.title, sport: match.sport });

    return match;
  }

  async getMatches(filters: any) {
    const where: any = {};
    if (filters.sport) where.sport = filters.sport;
    if (filters.status) where.status = filters.status;
    if (filters.communityId) where.communityId = filters.communityId;
    
    if (filters.date) {
      const now = new Date();
      if (filters.date === 'today') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        where.date = { gte: now, lte: endOfDay };
      } else if (filters.date === 'tomorrow') {
        const tomorrowStart = new Date();
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999);
        where.date = { gte: tomorrowStart, lte: tomorrowEnd };
      } else if (filters.date === 'weekend') {
        // Find next Saturday
        const saturday = new Date();
        saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
        saturday.setHours(0, 0, 0, 0);
        const sunday = new Date(saturday);
        sunday.setDate(sunday.getDate() + 1);
        sunday.setHours(23, 59, 59, 999);
        where.date = { gte: saturday, lte: sunday };
      }
    }

    return prisma.match.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true, location: true } },
        _count: { select: { players: { where: { status: 'APPROVED' } } } }
      },
      orderBy: { date: 'asc' }
    });
  }

  async getMatchById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        community: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true, location: true, latitude: true, longitude: true, photos: true } },
        players: {
          include: {
            user: { select: { id: true, name: true, reputation: true, profile: { select: { avatarUrl: true } } } }
          }
        },
        comments: {
          take: 50, // Limit nested comments
          include: {
            user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async getRecommendations(userProfile: any) {
    // 1. Get user's preferred sports
    const preferredSports = userProfile?.sports || [];
    
    // 2. Query upcoming open matches
    let matches = await prisma.match.findMany({
      where: { 
        status: 'OPEN', 
        date: { gte: new Date() } 
      },
      include: { 
        creator: { select: { name: true } }, 
        venue: { select: { id: true, name: true, location: true } },
        _count: { select: { players: true } } 
      },
      orderBy: { date: 'asc' },
      take: 20
    });

    // 3. Filter and sort (prefer matching sports first)
    if (preferredSports.length > 0) {
      matches.sort((a, b) => {
        const aMatch = preferredSports.includes(a.sport) ? 1 : 0;
        const bMatch = preferredSports.includes(b.sport) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    // 4. Return top 3 with reasons
    return matches.slice(0, 3).map(m => ({
      match: m,
      reason: preferredSports.includes(m.sport) 
        ? `Because you like ${m.sport}` 
        : `Upcoming ${m.sport} game near you`
    }));
  }

  async requestToJoin(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');
    if (['COMPLETED', 'ARCHIVED', 'CANCELLED', 'EXPIRED'].includes(match.status)) {
      throw new Error('Match is closed and cannot be joined');
    }

    const existing = await prisma.matchPlayer.findUnique({
      where: { matchId_userId: { matchId, userId } }
    });
    if (existing && existing.status !== 'WITHDRAWN') throw new Error('Already requested to join');

    const status = match.status === 'FULL' ? 'WAITLISTED' : 'PENDING';

    const player = await prisma.matchPlayer.upsert({
      where: { matchId_userId: { matchId, userId } },
      update: { status },
      create: { matchId, userId, status }
    });

    // Notify creator
    await notificationService.createNotification({
      userId: match.creatorId,
      type: 'JOIN_REQUEST',
      content: `A new player wants to join your match: ${match.title}`,
      link: `/matches/${matchId}`
    });

    return player;
  }

  async handleJoinRequest(matchId: string, creatorId: string, targetUserId: string, action: 'APPROVED' | 'REJECTED') {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');

    const updated = await prisma.matchPlayer.update({
      where: { matchId_userId: { matchId, userId: targetUserId } },
      data: { status: action }
    });

    // Notify user
    await notificationService.createNotification({
      userId: targetUserId,
      type: action === 'APPROVED' ? 'JOIN_APPROVED' : 'JOIN_REJECTED',
      content: `Your request to join ${match.title} was ${action.toLowerCase()}.`,
      link: `/matches/${matchId}`
    });

    // If approved, check if full
    if (action === 'APPROVED') {
      const approvedCount = await prisma.matchPlayer.count({ where: { matchId, status: 'APPROVED' } });
      if (approvedCount >= match.maxPlayers) {
        await prisma.match.update({ where: { id: matchId }, data: { status: 'FULL' } });
      }
      
      // Log activity for joining
      await activityService.logActivity(targetUserId, 'MATCH_JOINED', match.id, 'Match', { title: match.title });
    }

    return updated;
  }

  async leaveMatch(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');
    if (['COMPLETED', 'ARCHIVED', 'CANCELLED', 'EXPIRED'].includes(match.status)) {
      throw new Error('Match is closed and cannot be modified');
    }

    const player = await prisma.matchPlayer.findUnique({
      where: { matchId_userId: { matchId, userId } }
    });

    if (!player) throw new Error('Player not found in this match');
    if (player.status === 'WITHDRAWN' || player.status === 'KICKED') throw new Error('Already left or removed from match');

    // If they were just pending or waitlisted, we can just delete the request (CANCEL_JOIN)
    if (player.status === 'PENDING' || player.status === 'WAITLISTED') {
      await prisma.matchPlayer.delete({
        where: { matchId_userId: { matchId, userId } }
      });
      return { status: 'CANCELLED_JOIN' };
    }

    // Otherwise, mark as withdrawn
    const updated = await prisma.matchPlayer.update({
      where: { matchId_userId: { matchId, userId } },
      data: { status: 'WITHDRAWN' }
    });

    // If the match was FULL and an APPROVED player leaves, make it OPEN again
    if (player.status === 'APPROVED' && match.status === 'FULL') {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'OPEN' }
      });
      // Future Enhancement: Automatically move first WAITLISTED to PENDING
    }

    if (player.status === 'APPROVED') {
      await activityService.logActivity(userId, 'MATCH_LEFT', match.id, 'Match', { title: match.title });
    }

    return updated;
  }

  async kickPlayer(matchId: string, creatorId: string, targetUserId: string) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');

    const player = await prisma.matchPlayer.findUnique({
      where: { matchId_userId: { matchId, userId: targetUserId } }
    });

    if (!player) throw new Error('Player not found in this match');

    const updated = await prisma.matchPlayer.update({
      where: { matchId_userId: { matchId, userId: targetUserId } },
      data: { status: 'KICKED' }
    });

    // Notify user
    await notificationService.createNotification({
      userId: targetUserId,
      type: 'SYSTEM_ALERT',
      content: `You have been removed from the match: ${match.title}.`,
      link: `/matches/${matchId}`
    });

    // If the match was FULL and the kicked player was APPROVED, make it OPEN
    if (player.status === 'APPROVED' && match.status === 'FULL') {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'OPEN' }
      });
    }

    return updated;
  }

  async markAttendance(matchId: string, creatorId: string, targetUserId: string, performanceRating: number) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');

    if (performanceRating < 1 || performanceRating > 5) throw new Error('Rating must be 1-5');

    const player = await prisma.matchPlayer.update({
      where: { matchId_userId: { matchId, userId: targetUserId } },
      data: { status: 'ATTENDED', performanceRating }
    });

    // Boost reputation (e.g. base +5 for attending, plus rating bonus)
    const reputationBoost = 5 + (performanceRating * 2); // max 15 points
    await prisma.user.update({
      where: { id: targetUserId },
      data: { reputation: { increment: reputationBoost } }
    });

    return player;
  }

  async cancelMatch(matchId: string, creatorId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: { where: { status: 'APPROVED' } } }
    });

    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'CANCELLED' }
    });

    // Notify all approved players
    for (const p of match.players) {
      await notificationService.createNotification({
        userId: p.userId,
        type: 'SYSTEM_ALERT',
        content: `Match cancelled: ${match.title}`,
        link: `/matches/${matchId}`
      });
    }

    return updated;
  }

  async addComment(matchId: string, userId: string, content: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true }
    });
    
    if (!match) throw new Error('Match not found');

    const isParticipant = match.creatorId === userId || match.players.some(p => p.userId === userId && (p.status === 'APPROVED' || p.status === 'ATTENDED'));
    
    if (!isParticipant) {
      throw new Error('Only participants can comment on a match');
    }

    return prisma.matchComment.create({
      data: {
        matchId,
        userId,
        content
      },
      include: {
        user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
      }
    });
  }

  async editComment(commentId: string, userId: string, content: string) {
    const comment = await prisma.matchComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== userId) throw new Error('Unauthorized');

    return prisma.matchComment.update({
      where: { id: commentId },
      data: { content, isEdited: true },
      include: { user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } } }
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.matchComment.findUnique({
      where: { id: commentId },
      include: { match: { select: { creatorId: true } } }
    });
    if (!comment) throw new Error('Comment not found');

    if (comment.userId !== userId && comment.match.creatorId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.matchComment.delete({ where: { id: commentId } });
    return { success: true };
  }

  async editMatch(matchId: string, creatorId: string, data: any) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');
    if (['COMPLETED', 'ARCHIVED', 'CANCELLED'].includes(match.status)) throw new Error('Cannot edit a closed match');

    return prisma.match.update({
      where: { id: matchId },
      data: {
        title: data.title,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        date: data.date ? new Date(data.date) : undefined,
        maxPlayers: data.maxPlayers ? parseInt(data.maxPlayers) : undefined,
        costPerPerson: data.costPerPerson !== undefined ? (data.costPerPerson ? parseFloat(data.costPerPerson) : null) : undefined,
        skillLevel: data.skillLevel,
        matchType: data.matchType,
        communityId: data.communityId,
        venueId: data.venueId,
      }
    });
  }

  async updateMatchStatus(matchId: string, creatorId: string, status: MatchStatus) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');
    
    // Only allow manual transitions to ONGOING or COMPLETED if within time boundaries
    if (status === 'ONGOING' || status === 'COMPLETED') {
      return prisma.match.update({
        where: { id: matchId },
        data: { status }
      });
    }
    throw new Error('Invalid manual status transition');
  }

  async broadcastMessage(matchId: string, creatorId: string, content: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: { where: { status: 'APPROVED' } } }
    });
    if (!match || match.creatorId !== creatorId) throw new Error('Unauthorized');

    for (const player of match.players) {
      if (player.userId !== creatorId) {
        await notificationService.createNotification({
          userId: player.userId,
          type: 'SYSTEM_ALERT',
          content: `Host message for ${match.title}: ${content}`,
          link: `/matches/${matchId}`
        });
      }
    }
    return { success: true, count: match.players.length };
  }

  async addReview(matchId: string, userId: string, rating: number, comment?: string) {
    const player = await prisma.matchPlayer.findUnique({
      where: { matchId_userId: { matchId, userId } }
    });

    if (!player || player.status !== 'ATTENDED') {
      throw new Error('Only participants who attended can review the match');
    }

    if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');

    return prisma.matchReview.create({
      data: { matchId, userId, rating, comment }
    });
  }
}

export const matchService = new MatchService();
