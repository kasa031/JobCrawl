import { Router } from 'express';
import { register, login, getMe, verifyEmail, resendVerification } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', authenticate, getMe);

export default router;

