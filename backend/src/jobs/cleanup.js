import cron from 'node-cron';
import { cleanupExpiredCompetitions } from '../controllers/competition.controller.js';

// Run every 5 minutes
export const startCleanupJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running expired competitions cleanup...');
    try {
      await cleanupExpiredCompetitions();
    } catch (error) {
      console.error('Cleanup job failed:', error);
    }
  });
  
  console.log('Cleanup cron job started');
};