import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import { uploadsDirPath } from '../middleware/upload';
import { logError, logInfo } from '../config/logger';

export const getProfile = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId },
      });
    }

    res.json(profile);
  } catch (error) {
    logError('Get profile error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { fullName, skills, experience, education, location, bio, phone, preferences } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update User.fullName if provided
    if (fullName !== undefined) {
      const validFullName = typeof fullName === 'string' && fullName.trim().length >= 2 && fullName.trim().length <= 100 
        ? fullName.trim() 
        : null;
      
      if (validFullName) {
        await prisma.user.update({
          where: { id: userId },
          data: { fullName: validFullName },
        });
        logInfo('User fullName updated', { userId: req.userId, fullName: validFullName });
      }
    }

    // Validate input
    const validSkills = Array.isArray(skills) ? skills.filter((s: any) => typeof s === 'string' && s.length <= 100).slice(0, 50) : [];
    const validExperience = typeof experience === 'number' && experience >= 0 && experience <= 100 ? experience : 0;
    const validEducation = typeof education === 'string' && education.length <= 200 ? education : null;
    const validLocation = typeof location === 'string' && location.length <= 100 ? location : null;
    const validPhone = typeof phone === 'string' && phone.length <= 50 ? phone : null;
    const validBio = typeof bio === 'string' && bio.length <= 2000 ? bio : null;
    
    // Validate preferences as JSON object
    let validPreferences = null;
    if (preferences !== undefined) {
      try {
        if (typeof preferences === 'object' && preferences !== null) {
          validPreferences = JSON.parse(JSON.stringify(preferences));
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid preferences format. Must be a valid JSON object.' });
      }
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        skills: validSkills,
        experience: validExperience,
        education: validEducation,
        location: validLocation,
        bio: validBio,
        phone: validPhone,
        preferences: validPreferences,
      },
      create: {
        userId,
        skills: validSkills,
        experience: validExperience,
        education: validEducation,
        location: validLocation,
        bio: validBio,
        phone: validPhone,
        preferences: validPreferences,
      },
    });

    logInfo('Profile updated', { userId: req.userId });
    res.json(profile);
  } catch (error) {
    logError('Update profile error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadCV = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get existing profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    // Delete old CV if it exists
    if (existingProfile?.cvPath) {
      const oldFilePath = path.join(uploadsDirPath, path.basename(existingProfile.cvPath));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Save file path relative to uploads directory
    const filePath = `/uploads/cvs/${req.file.filename}`;

    // Update profile with new CV path
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        cvPath: filePath,
      },
      create: {
        userId,
        cvPath: filePath,
      },
    });

    logInfo('CV uploaded', { userId: req.userId, cvPath: filePath });
    
    res.json({
      message: 'CV uploaded successfully',
      cvPath: filePath,
      profile
    });
  } catch (error) {
    logError('Upload CV error', error as Error, { userId: req.userId });
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(uploadsDirPath, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ error: 'Failed to upload CV' });
  }
};

export const deleteCV = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.cvPath) {
      return res.status(404).json({ error: 'No CV found' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDirPath, path.basename(profile.cvPath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update profile to remove CV path
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        cvPath: null,
      },
    });

    logInfo('CV deleted', { userId: req.userId });
    res.json({ 
      message: 'CV deleted successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    logError('Delete CV error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to delete CV' });
  }
};

export const getCV = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.cvPath) {
      return res.status(404).json({ error: 'No CV found' });
    }

    const filePath = path.join(uploadsDirPath, path.basename(profile.cvPath));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'CV file not found on server' });
    }

    const cvPath = profile.cvPath;
    logInfo('CV downloaded', { userId: req.userId, cvPath });
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    logError('Get CV error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get CV' });
  }
};

