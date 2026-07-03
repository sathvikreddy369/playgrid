import prisma from '../utils/db';
import { CommunityStatus, CommunityPrivacy, CommunityRole, CommunityMemberStatus, MatchType } from '@prisma/client';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';
import { getIO } from '../socket';

interface CreateCommunityData {
  name: string;
  description: string;
  location?: string;
  rules?: string[];
  coverImage?: string;
  avatarUrl?: string;
  sports?: string[];
  tags?: string[];
  primaryVenueId?: string;
  privacy?: CommunityPrivacy;
}

export class CommunityService {
  async createCommunity(userId: string, data: CreateCommunityData) {
    const community = await prisma.community.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        rules: data.rules || [],
        coverImage: data.coverImage,
        avatarUrl: data.avatarUrl,
        sports: data.sports || [],
        tags: data.tags || [],
        primaryVenueId: data.primaryVenueId,
        privacy: data.privacy || CommunityPrivacy.PUBLIC,
        ownerId: userId,
        status: CommunityStatus.PENDING,
        members: {
          create: [{ 
            userId, 
            role: CommunityRole.OWNER, 
            status: CommunityMemberStatus.APPROVED 
          }]
        }
      },
    });

    await activityService.logActivity(userId, 'COMMUNITY_CREATED', community.id, 'Community', { name: community.name });

    return community;
  }

  async getCommunities(filters?: { lat?: number; lng?: number; radius?: number; sport?: string; search?: string }) {
    let where: any = { status: CommunityStatus.VERIFIED };

    if (filters?.sport) {
      where.sports = { has: filters.sport };
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const communities = await prisma.community.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        primaryVenue: { select: { id: true, name: true, latitude: true, longitude: true } },
        _count: { select: { members: { where: { status: CommunityMemberStatus.APPROVED } }, matches: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (filters?.lat && filters?.lng) {
      const radius = filters.radius || 50;
      return communities.map((c: any) => {
        if (!c.primaryVenue?.latitude || !c.primaryVenue?.longitude) return { ...c, distance: Infinity };
        const R = 6371;
        const dLat = (c.primaryVenue.latitude - filters.lat!) * Math.PI / 180;
        const dLon = (c.primaryVenue.longitude - filters.lng!) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(filters.lat! * Math.PI / 180) * Math.cos(c.primaryVenue.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const cVal = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return { ...c, distance: R * cVal };
      }).filter((c: any) => c.distance <= radius).sort((a: any, b: any) => a.distance - b.distance);
    }

    return communities;
  }

  async getCommunityById(id: string) {
    return prisma.community.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        primaryVenue: { select: { id: true, name: true, location: true, photos: true } },
        members: {
          where: { status: { in: [CommunityMemberStatus.APPROVED, CommunityMemberStatus.PENDING] } },
          include: {
            user: { select: { id: true, name: true, role: true, reputation: true, profile: { select: { avatarUrl: true, sports: true } } } }
          }
        },
        _count: { 
          select: { 
            members: { where: { status: CommunityMemberStatus.APPROVED } }, 
            matches: { where: { status: { notIn: ['CANCELLED', 'EXPIRED'] } } }
          } 
        }
      }
    });
  }

  async joinCommunity(communityId: string, userId: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } }
    });

    if (existing) {
      if (existing.status === CommunityMemberStatus.BANNED) throw new Error('You are banned from this community');
      throw new Error('Already a member or request pending');
    }

    const status = community.privacy === CommunityPrivacy.PRIVATE 
      ? CommunityMemberStatus.PENDING 
      : CommunityMemberStatus.APPROVED;

    const member = await prisma.communityMember.create({
      data: { 
        userId, 
        communityId, 
        role: CommunityRole.MEMBER, 
        status 
      }
    });

    if (status === CommunityMemberStatus.APPROVED) {
      await activityService.logActivity(userId, 'COMMUNITY_JOINED', community.id, 'Community', { name: community.name });
      try {
        getIO().to(`community:${communityId}`).emit('community_member_joined', { userId, communityId });
      } catch (err) {
        console.error('Socket emit error', err);
      }
    }

    return member;
  }

  async inviteUser(communityId: string, inviterId: string, targetUserId: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });

    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: targetUserId, communityId } }
    });

    if (existing) {
      if (existing.status === CommunityMemberStatus.BANNED) throw new Error('User is banned');
      throw new Error(`User already has status: ${existing.status}`);
    }

    const member = await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: targetUserId, communityId } },
      update: { status: 'INVITED' },
      create: { userId: targetUserId, communityId, role: 'MEMBER', status: 'INVITED' }
    });

    await notificationService.createNotification({
      userId: targetUserId,
      type: 'COMMUNITY_INVITE',
      content: `${inviter?.name || 'Someone'} invited you to join ${community.name}.`,
      link: `/communities/${communityId}`
    });

    return member;
  }

  async leaveCommunity(communityId: string, userId: string) {
    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } }
    });

    if (!existing) throw new Error('Not a member');
    if (existing.role === CommunityRole.OWNER) throw new Error('Owner cannot leave the community. Transfer ownership first.');

    return prisma.communityMember.delete({
      where: { id: existing.id }
    });
  }

  async approveMember(communityId: string, memberUserId: string, requesterId: string) {
    await this.ensureAdminOrOwner(communityId, requesterId);

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: memberUserId, communityId } }
    });

    if (!member || member.status !== CommunityMemberStatus.PENDING) throw new Error('Pending request not found');

    const updated = await prisma.communityMember.update({
      where: { id: member.id },
      data: { status: CommunityMemberStatus.APPROVED }
    });

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (community) {
      await activityService.logActivity(memberUserId, 'COMMUNITY_JOINED', community.id, 'Community', { name: community.name });
      try {
        getIO().to(`community:${communityId}`).emit('community_member_joined', { userId: memberUserId, communityId });
      } catch (err) {
        console.error('Socket emit error', err);
      }
    }

    return updated;
  }

  async rejectMember(communityId: string, memberUserId: string, requesterId: string) {
    await this.ensureAdminOrOwner(communityId, requesterId);

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: memberUserId, communityId } }
    });

    if (!member || member.status !== CommunityMemberStatus.PENDING) throw new Error('Pending request not found');

    return prisma.communityMember.update({
      where: { id: member.id },
      data: { status: CommunityMemberStatus.REJECTED }
    });
  }

  async updateMemberRole(communityId: string, memberUserId: string, newRole: CommunityRole, requesterId: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    if (community.ownerId !== requesterId) {
      throw new Error('Only the owner can update roles');
    }

    if (memberUserId === community.ownerId) {
      throw new Error('Cannot change owner role this way');
    }

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: memberUserId, communityId } }
    });

    if (!member || member.status !== CommunityMemberStatus.APPROVED) throw new Error('User is not an approved member');

    return prisma.communityMember.update({
      where: { id: member.id },
      data: { role: newRole }
    });
  }

  async kickMember(communityId: string, memberUserId: string, requesterId: string, requesterSystemRole: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    if (community.ownerId === memberUserId) {
      throw new Error('Cannot kick the owner');
    }

    const requester = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: requesterId, communityId } }
    });

    const isPlatformAdmin = requesterSystemRole === 'ADMIN';
    const isOwner = community.ownerId === requesterId;
    const isAdmin = requester?.role === CommunityRole.ADMIN;

    if (!isPlatformAdmin && !isOwner && !isAdmin) {
      throw new Error('Unauthorized to kick members');
    }

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: memberUserId, communityId } }
    });

    if (!member) throw new Error('User is not a member');

    if (isAdmin && !isOwner && member.role === CommunityRole.ADMIN) {
      throw new Error('Admins cannot kick other admins');
    }

    return prisma.communityMember.delete({ where: { id: member.id } });
  }

  async verifyCommunity(communityId: string, status: CommunityStatus, adminId: string, adminRole: string) {
    if (adminRole !== 'ADMIN') throw new Error('Unauthorized');

    return prisma.community.update({
      where: { id: communityId },
      data: { status }
    });
  }

  private async ensureAdminOrOwner(communityId: string, userId: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    if (community.ownerId === userId) return true;

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } }
    });

    if (!member || (member.role !== CommunityRole.ADMIN && member.role !== CommunityRole.OWNER)) {
      throw new Error('Unauthorized');
    }

    return true;
  }
}

export const communityService = new CommunityService();
