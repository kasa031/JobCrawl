import { Router } from 'express';
import { register, login, getMe, verifyEmail, resendVerification, requestPasswordReset, resetPassword, refreshToken } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

export default router;

