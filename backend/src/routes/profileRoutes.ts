import { Router } from 'express';
import { getProfile, updateProfile, uploadCV, deleteCV, getCV } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { uploadCV as uploadMiddleware } from '../middleware/upload';

const router = Router();

// Apply authentication middleware
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-cv', uploadMiddleware.single('cv'), uploadCV);
router.delete('/cv', deleteCV);
router.get('/cv', getCV);

export default router;

