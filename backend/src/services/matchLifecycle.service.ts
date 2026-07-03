import prisma from '../utils/db';
import { StructuredLogger } from '../utils/logger';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';

export class MatchLifecycleService {
  /**
   * Idempotently marks matches as ONGOING if they have started.
   */
  async transitionToOngoing() {
    const now = new Date();
    const toOngoing = await prisma.match.findMany({
      where: {
        status: { in: ['OPEN', 'FULL'] },
        date: { lte: now }
      },
      select: { id: true, title: true }
    });

    if (toOngoing.length === 0) return 0;

    await prisma.match.updateMany({
      where: { id: { in: toOngoing.map(m => m.id) } },
      data: { status: 'ONGOING' }
    });

    StructuredLogger.info(`Transitioned ${toOngoing.length} matches to ONGOING`);
    return toOngoing.length;
  }

  /**
   * Idempotently marks ONGOING matches as COMPLETED if they ended
   * (assuming 2 hours default duration).
   * Also triggers side effects for attendance and notifications.
   */
  async transitionToCompleted() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    const matches = await prisma.match.findMany({
      where: {
        status: 'ONGOING',
        date: { lte: twoHoursAgo }
      },
      include: {
        players: { where: { status: 'APPROVED' } },
        creator: { select: { id: true } }
      }
    });

    if (matches.length === 0) return 0;

    for (const match of matches) {
      // 1. Update status
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'COMPLETED' }
      });

      // 2. Notify Creator to Mark Attendance
      await notificationService.createNotification({
        userId: match.creatorId,
        type: 'SYSTEM_ALERT',
        content: `Your match "${match.title}" has ended. Please mark attendance for your players.`,
        link: `/matches/${match.id}`
      });

      // 3. Notify Players to Review Host/Match
      for (const player of match.players) {
        if (player.userId !== match.creatorId) {
          await notificationService.createNotification({
            userId: player.userId,
            type: 'SYSTEM_ALERT',
            content: `Match "${match.title}" has ended. Leave a review for your host!`,
            link: `/matches/${match.id}`
          });
        }
      }
    }

    StructuredLogger.info(`Transitioned ${matches.length} matches to COMPLETED`);
    return matches.length;
  }

  /**
   * Marks COMPLETED matches as ARCHIVED after 7 days.
   */
  async transitionToArchived() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await prisma.match.updateMany({
      where: {
        status: 'COMPLETED',
        date: { lte: sevenDaysAgo }
      },
      data: { status: 'ARCHIVED' }
    });

    if (result.count > 0) StructuredLogger.info(`Transitioned ${result.count} matches to ARCHIVED`);
    return result.count;
  }

  /**
   * Auto-cancels matches if they expire with 0 approved players.
   */
  async transitionToExpired() {
    const now = new Date();
    // If a match is OPEN past its start time but has 0 players
    const matches = await prisma.match.findMany({
      where: {
        status: 'OPEN',
        date: { lte: now }
      },
      include: {
        _count: { select: { players: { where: { status: 'APPROVED' } } } }
      }
    });

    const emptyMatches = matches.filter(m => m._count.players === 0);
    if (emptyMatches.length === 0) return 0;

    await prisma.match.updateMany({
      where: { id: { in: emptyMatches.map(m => m.id) } },
      data: { status: 'EXPIRED' }
    });

    // Notify creators
    for (const match of emptyMatches) {
      await notificationService.createNotification({
        userId: match.creatorId,
        type: 'SYSTEM_ALERT',
        content: `Your match "${match.title}" expired with 0 players and was automatically cancelled.`,
        link: `/matches/${match.id}`
      });
    }

    StructuredLogger.info(`Transitioned ${emptyMatches.length} matches to EXPIRED`);
    return emptyMatches.length;
  }
}

export const matchLifecycleService = new MatchLifecycleService();
