import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logError, logInfo } from '../config/logger';

export const getApplications = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        jobListing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    logError('Get applications error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobListingId, coverLetter, status = 'DRAFT' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobListingId || typeof jobListingId !== 'string' || jobListingId.length > 100) {
      return res.status(400).json({ error: 'Valid job listing ID is required' });
    }

    // Validate status enum
    const validStatuses = ['DRAFT', 'PENDING', 'SENT', 'VIEWED', 'REJECTED', 'ACCEPTED', 'INTERVIEW', 'OFFER'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Validate cover letter length if provided
    if (coverLetter && (typeof coverLetter !== 'string' || coverLetter.length > 10000)) {
      return res.status(400).json({ error: 'Cover letter must be a string with maximum 10000 characters' });
    }

    // Check if job exists
    const job = await prisma.jobListing.findUnique({
      where: { id: jobListingId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job listing not found' });
    }

    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobListingId: {
          userId,
          jobListingId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Application already exists for this job' });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobListingId,
        coverLetter,
        status,
      },
      include: {
        jobListing: true,
      },
    });

    logInfo('Application created', { userId: req.userId, applicationId: application.id, jobListingId: req.body.jobListingId });
    res.status(201).json({ application });
  } catch (error) {
    logError('Create application error', error as Error, { userId: req.userId, jobListingId: req.body.jobListingId });
    res.status(500).json({ error: 'Failed to create application' });
  }
};

export const updateApplication = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status, coverLetter, notes, sentDate, responseDate, response } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate application ID
    if (!id || typeof id !== 'string' || id.length > 100) {
      return res.status(400).json({ error: 'Invalid application ID format' });
    }

    // Validate status enum if provided
    if (status) {
      const validStatuses = ['DRAFT', 'PENDING', 'SENT', 'VIEWED', 'REJECTED', 'ACCEPTED', 'INTERVIEW', 'OFFER'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
    }

    // Validate string lengths
    if (coverLetter && (typeof coverLetter !== 'string' || coverLetter.length > 10000)) {
      return res.status(400).json({ error: 'Cover letter must be a string with maximum 10000 characters' });
    }

    if (notes && (typeof notes !== 'string' || notes.length > 5000)) {
      return res.status(400).json({ error: 'Notes must be a string with maximum 5000 characters' });
    }

    if (response && (typeof response !== 'string' || response.length > 5000)) {
      return res.status(400).json({ error: 'Response must be a string with maximum 5000 characters' });
    }

    // Validate dates if provided
    let validSentDate: Date | undefined;
    let validResponseDate: Date | undefined;
    
    if (sentDate) {
      validSentDate = new Date(sentDate);
      if (isNaN(validSentDate.getTime())) {
        return res.status(400).json({ error: 'Invalid sentDate format. Must be a valid ISO date string.' });
      }
    }

    if (responseDate) {
      validResponseDate = new Date(responseDate);
      if (isNaN(validResponseDate.getTime())) {
        return res.status(400).json({ error: 'Invalid responseDate format. Must be a valid ISO date string.' });
      }
    }

    // Check if application exists and belongs to user
    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        coverLetter,
        notes,
        sentDate: validSentDate,
        responseDate: validResponseDate,
        response,
      },
      include: {
        jobListing: true,
      },
    });

    const applicationId = req.params.id;
    logInfo('Application updated', { userId: req.userId, applicationId, status });
    res.json({ application });
  } catch (error) {
    const applicationId = req.params.id;
    logError('Update application error', error as Error, { userId: req.userId, applicationId });
    res.status(500).json({ error: 'Failed to update application' });
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate application ID
    if (!id || typeof id !== 'string' || id.length > 100) {
      return res.status(400).json({ error: 'Invalid application ID format' });
    }

    // Check if application exists and belongs to user
    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await prisma.application.delete({
      where: { id },
    });

    const applicationId = req.params.id;
    logInfo('Application deleted', { userId: req.userId, applicationId });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    const applicationId = req.params.id;
    logError('Delete application error', error as Error, { userId: req.userId, applicationId });
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

