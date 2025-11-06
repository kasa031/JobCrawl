import { Router } from 'express';
import { getApplications, createApplication, updateApplication, deleteApplication, bulkDeleteApplications, bulkUpdateApplicationStatus } from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);
router.post('/bulk/delete', bulkDeleteApplications);
router.post('/bulk/update-status', bulkUpdateApplicationStatus);

export default router;

