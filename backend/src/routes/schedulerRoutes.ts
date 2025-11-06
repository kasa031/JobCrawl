import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { schedulerService } from '../services/scheduler/SchedulerService';
import { logError, logInfo } from '../config/logger';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Get scheduler status
 */
router.get('/status', async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const status = schedulerService.getStatus();
    res.json({ status });
  } catch (error) {
    logError('Error getting scheduler status', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

/**
 * Start scheduled scraping
 */
router.post('/start', async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { intervalHours, keywords, location } = req.body;

    const intervalMs = intervalHours ? intervalHours * 60 * 60 * 1000 : 6 * 60 * 60 * 1000; // Default 6 hours

    schedulerService.startScheduledScraping(intervalMs, keywords, location);

    logInfo('Scheduled scraping started via API', { intervalHours: intervalMs / 1000 / 60 / 60, keywords, location, userId: req.userId });
    res.json({
      message: 'Scheduled scraping started',
      intervalHours: intervalMs / 1000 / 60 / 60,
      keywords,
      location,
    });
  } catch (error) {
    logError('Error starting scheduled scraping', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to start scheduled scraping' });
  }
});

/**
 * Stop scheduled scraping
 */
router.post('/stop', async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    schedulerService.stopScheduledScraping();

    logInfo('Scheduled scraping stopped via API', { userId: req.userId });
    res.json({ message: 'Scheduled scraping stopped' });
  } catch (error) {
    logError('Error stopping scheduled scraping', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to stop scheduled scraping' });
  }
});

export default router;

