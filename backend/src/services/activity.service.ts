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
}

export const activityService = new ActivityService();
