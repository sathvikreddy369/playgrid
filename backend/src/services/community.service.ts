import prisma from '../utils/db';
import { CommunityStatus } from '@prisma/client';

export class CommunityService {
  async createCommunity(userId: string, data: { name: string; description: string; location?: string }) {
    return prisma.community.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        ownerId: userId,
        status: CommunityStatus.PENDING,
        members: {
          create: [{ userId }] // Automatically make creator a member
        }
      },
    });
  }

  async getCommunities(status?: CommunityStatus) {
    return prisma.community.findMany({
      where: status ? { status } : { status: CommunityStatus.VERIFIED },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { members: true, matches: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCommunityById(id: string) {
    return prisma.community.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        members: {
          include: {
            user: { select: { id: true, name: true, role: true, profile: { select: { avatarUrl: true } } } }
          }
        },
        _count: { select: { members: true, matches: true } }
      }
    });
  }

  async joinCommunity(communityId: string, userId: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } }
    });

    if (existing) throw new Error('Already a member');

    return prisma.communityMember.create({
      data: { userId, communityId }
    });
  }

  async leaveCommunity(communityId: string, userId: string) {
    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } }
    });

    if (!existing) throw new Error('Not a member');

    return prisma.communityMember.delete({
      where: { id: existing.id }
    });
  }

  async kickMember(communityId: string, memberUserId: string, requesterId: string, requesterRole: string) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error('Community not found');

    // Only owner or platform admin can kick
    if (community.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    if (community.ownerId === memberUserId) {
      throw new Error('Cannot kick the owner');
    }

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: memberUserId, communityId } }
    });

    if (!member) throw new Error('User is not a member');

    return prisma.communityMember.delete({ where: { id: member.id } });
  }

  async verifyCommunity(communityId: string, status: CommunityStatus, adminId: string, adminRole: string) {
    if (adminRole !== 'ADMIN') throw new Error('Unauthorized');

    return prisma.community.update({
      where: { id: communityId },
      data: { status }
    });
  }
}

export const communityService = new CommunityService();
