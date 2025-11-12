import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logError, logInfo } from '../config/logger';
import { validateUUID } from '../utils/validation';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        jobListing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ favorites: favorites.map(f => f.jobListing) });
  } catch (error) {
    logError('Get favorites error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobListingId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobListingId || typeof jobListingId !== 'string' || !validateUUID(jobListingId)) {
      return res.status(400).json({ error: 'Valid job listing ID (UUID) is required' });
    }

    // Check if job exists
    const job = await prisma.jobListing.findUnique({
      where: { id: jobListingId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job listing not found' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_jobListingId: {
          userId,
          jobListingId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Job already favorited' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        jobListingId,
      },
      include: {
        jobListing: true,
      },
    });

    logInfo('Favorite added', { userId: req.userId, jobListingId });
    res.status(201).json({ favorite: favorite.jobListing });
  } catch (error) {
    logError('Add favorite error', error as Error, { userId: req.userId, jobListingId: req.body.jobListingId });
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobListingId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobListingId || typeof jobListingId !== 'string') {
      return res.status(400).json({ error: 'Invalid job listing ID format' });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_jobListingId: {
          userId,
          jobListingId,
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: {
        userId_jobListingId: {
          userId,
          jobListingId,
        },
      },
    });

    logInfo('Favorite removed', { userId: req.userId, jobListingId });
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    logError('Remove favorite error', error as Error, { userId: req.userId, jobListingId: req.params.jobListingId });
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobListingId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobListingId || typeof jobListingId !== 'string') {
      return res.status(400).json({ error: 'Invalid job listing ID format' });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_jobListingId: {
          userId,
          jobListingId,
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    logError('Check favorite error', error as Error, { userId: req.userId, jobListingId: req.params.jobListingId });
    res.status(500).json({ error: 'Failed to check favorite' });
  }
};

