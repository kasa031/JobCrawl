import { Router } from 'express';
import { getUserAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.get('/', getUserAnalytics);

export default router;

