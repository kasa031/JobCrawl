import express from 'express';
import { authenticate } from '../middleware/auth';
import * as favoriteController from '../controllers/favoriteController';

const router = express.Router();

// All favorite routes require authentication
router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:jobListingId', favoriteController.removeFavorite);
router.get('/:jobListingId/check', favoriteController.checkFavorite);

export default router;

