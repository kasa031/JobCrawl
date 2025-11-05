import { Router } from 'express';
import { getJobs, getJobById, refreshJobs } from '../controllers/jobController';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/refresh', refreshJobs); // Accepts query params: ?q=search&location=oslo

export default router;

