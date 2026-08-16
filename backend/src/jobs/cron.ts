import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run every hour
export const startCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running Match Status Update Job...');
    try {
      const now = new Date();
      
      // Update matches that have started to 'COMPLETED' or 'ONGOING'
      // Note: In our current schema, we have AVAILABLE, FILLED, COMPLETED, CANCELLED
      // If a match is past its date/time, we can mark it as COMPLETED automatically, 
      // preventing further requests to join.
      
      const updatedMatches = await prisma.match.updateMany({
        where: {
          date: {
            lt: now
          },
          status: {
            in: ['AVAILABLE', 'FILLED']
          }
        },
        data: {
          status: 'COMPLETED'
        }
      });
      
      console.log(`Locked ${updatedMatches.count} past matches.`);
    } catch (error) {
      console.error('Error in Match Status Update Job:', error);
    }
  });
  
  console.log('Cron jobs initialized.');
};
