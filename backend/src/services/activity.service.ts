import prisma from '../utils/db';
import { ActivityType } from '@prisma/client';
import { StructuredLogger } from '../utils/logger';

export class ActivityService {
  async logActivity(
    userId: string,
    type: ActivityType,
    entityId?: string,
    entityType?: string,
    metadata?: any
  ) {
    try {
      const activity = await prisma.activity.create({
        data: {
          userId,
          type,
          entityId,
          entityType,
          metadata: metadata || {}
        }
      });
      return activity;
    } catch (error) {
      StructuredLogger.error('Failed to log activity', undefined, { userId, type, entityId, error });
    }
  }

  async getUserActivities(userId: string, limit = 20, offset = 0) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { user: { select: { name: true, profile: { select: { avatarUrl: true } } } } }
    });
  }

  async getFeedActivities(userId: string, limit = 20, cursor?: string) {
    // 1. Get user's connections
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
        status: 'ACCEPTED'
      }
    });

    const friendIds = connections.map(c => c.requesterId === userId ? c.recipientId : c.requesterId);
    friendIds.push(userId); // Include own activities

    // 2. Fetch activities
    return prisma.activity.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } } }
    });
  }
}

export const activityService = new ActivityService();
