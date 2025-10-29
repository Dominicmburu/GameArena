import cron from 'node-cron';
import { cleanupExpiredCompetitions, updateCompetitionStatuses } from '../controllers/competition.controller.js';

// Run every 5 minutes
export const startCleanupJob = (io) => {

  // Job 1: Check for competitions that should start (every minute)
  // This ensures UPCOMING -> ONGOING transitions happen immediately
  cron.schedule('* * * * *', async () => {
    try {
      await updateCompetitionStatuses(io);
    } catch (error) {
      console.error('❌ Status update job failed:', error);
    }
  });

  cron.schedule('*/5 * * * *', async () => {
    console.log('Running expired competitions cleanup...');
    try {
      await cleanupExpiredCompetitions(io);
    } catch (error) {
      console.error('Cleanup job failed:', error);
    }
  });
  
  console.log('Cleanup cron job started');
};