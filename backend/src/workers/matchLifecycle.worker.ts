import cron from 'node-cron';
import prisma from '../utils/db';
import { StructuredLogger } from '../utils/logger';

export const startMatchLifecycleWorker = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();

      // 1. OPEN/FULL -> ONGOING (when start time arrives)
      const toOngoing = await prisma.match.updateMany({
        where: {
          status: { in: ['OPEN', 'FULL'] },
          date: { lte: now }
        },
        data: { status: 'ONGOING' }
      });
      if (toOngoing.count > 0) StructuredLogger.info(`Transitioned ${toOngoing.count} matches to ONGOING`);

      // 2. ONGOING -> COMPLETED (Assuming 2 hours default duration)
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const toCompleted = await prisma.match.updateMany({
        where: {
          status: 'ONGOING',
          date: { lte: twoHoursAgo }
        },
        data: { status: 'COMPLETED' }
      });
      if (toCompleted.count > 0) StructuredLogger.info(`Transitioned ${toCompleted.count} matches to COMPLETED`);

      // 3. COMPLETED -> ARCHIVED (after 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const toArchived = await prisma.match.updateMany({
        where: {
          status: 'COMPLETED',
          date: { lte: sevenDaysAgo }
        },
        data: { status: 'ARCHIVED' }
      });
      if (toArchived.count > 0) StructuredLogger.info(`Transitioned ${toArchived.count} matches to ARCHIVED`);

    } catch (error) {
      StructuredLogger.error('Match Lifecycle Worker Error', undefined, { error });
    }
  });
};
