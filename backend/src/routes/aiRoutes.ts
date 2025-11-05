import { Router } from 'express';
import { generateCoverLetter, generateCoverLetterFromText, matchJob, suggestImprovements } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All AI endpoints require authentication
router.post('/cover-letter', authenticate, generateCoverLetter);
router.post('/cover-letter-from-text', authenticate, generateCoverLetterFromText);
router.post('/match', authenticate, matchJob);
router.post('/suggestions', authenticate, suggestImprovements);

export default router;

