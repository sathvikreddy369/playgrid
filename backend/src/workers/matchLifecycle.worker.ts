import cron from 'node-cron';
import { matchLifecycleService } from '../services/matchLifecycle.service';
import { StructuredLogger } from '../utils/logger';

export const startMatchLifecycleWorker = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await matchLifecycleService.transitionToExpired();
      await matchLifecycleService.transitionToOngoing();
      await matchLifecycleService.transitionToCompleted();
      await matchLifecycleService.transitionToArchived();
    } catch (error) {
      StructuredLogger.error('Match Lifecycle Worker Error', undefined, { error });
    }
  });
};
