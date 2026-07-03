import prisma from '../utils/db';
import { ModerationActionType } from '@prisma/client';

export class ModerationService {
  async issueAction(moderatorId: string, userId: string, actionType: ModerationActionType, reason: string, expiresAt?: Date) {
    // Basic permissions check could go here if not handled by controller
    const action = await prisma.moderationAction.create({
      data: {
        moderatorId,
        userId,
        actionType,
        reason,
        expiresAt
      }
    });

    // Optionally ban user
    if (actionType === 'BAN') {
      await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: true }
      });
    }

    return action;
  }

  async getUserActions(userId: string) {
    return prisma.moderationAction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const moderationService = new ModerationService();
