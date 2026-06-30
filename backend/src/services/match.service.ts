import prisma from '../utils/db';
import { MatchStatus } from '@prisma/client';
import { notificationService } from './notification.service';
import { FraudDetection } from '../utils/fraudDetection';

export class MatchService {
  async createMatch(userId: string, data: any) {
    const cost = data.costPerPerson ? parseFloat(data.costPerPerson) : 0;
    
    // Deterministic Fake Event Check
    const fraudCheck = FraudDetection.isFakeEvent(data.title, cost);
    if (fraudCheck.isFake) {
      throw new Error(`Match creation blocked: ${fraudCheck.reason}`);
    }

    return prisma.match.create({
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
        creatorId: userId,
        communityId: data.communityId || null,
        status: MatchStatus.OPEN,
      },
    });
  }

  async getMatches(filters: any) {
    const where: any = {};
    if (filters.sport) where.sport = filters.sport;
    if (filters.status) where.status = filters.status;
    if (filters.communityId) where.communityId = filters.communityId;

    return prisma.match.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
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
    if (match.status !== 'OPEN') throw new Error('Match is not open');

    const existing = await prisma.matchPlayer.findUnique({
      where: { matchId_userId: { matchId, userId } }
    });
    if (existing) throw new Error('Already requested to join');

    const player = await prisma.matchPlayer.create({
      data: { matchId, userId, status: 'PENDING' }
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
}

export const matchService = new MatchService();
