import { Response } from 'express';
import { AIService } from '../services/ai/AIService';
import { CVService } from '../services/cv/CVService';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logError, logInfo } from '../config/logger';
import { validateUUID } from '../utils/validation';

// Lazy initialization - AIService blir instantiert når den først brukes
// Dette sikrer at dotenv.config() har kjørt først
let aiServiceInstance: AIService | null = null;
const getAIService = () => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

const cvService = new CVService();

export const generateCoverLetterFromText = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobTitle, company, jobDescription } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = user.profile || {
      skills: [] as string[],
      experience: 0,
      education: null,
      bio: null,
      cvPath: null,
    };

    // Try to parse CV if it exists
    let cvText: string | undefined;
    if (profile && profile.cvPath) {
      try {
        const parsedCV = await cvService.parseCV(profile.cvPath);
        cvText = cvService.formatCVForAI(parsedCV);
        logInfo('CV parsed successfully', { 
          userId: req.userId, 
          cvPath: profile.cvPath,
          cvLength: cvText.length,
          cvPreview: cvText.substring(0, 500), // Log first 500 chars to verify it's being parsed
          cvFormatted: true
        });
      } catch (error) {
        logError('Failed to parse CV, using profile instead', error as Error, { userId: req.userId, cvPath: profile.cvPath });
        // Continue without CV, will use profile data
      }
    }

    // Log whether CV text will be used
    logInfo('Generating cover letter', { 
      userId: req.userId, 
      hasCVText: !!cvText,
      cvTextLength: cvText?.length || 0,
      jobTitle,
      company
    });

    const coverLetter = await getAIService().generateCoverLetter(
      jobTitle || 'Stillingsutlysning',
      company || 'Bedrift',
      jobDescription,
      {
        fullName: user.fullName,
        skills: profile.skills || [],
        experience: profile.experience || 0,
        education: profile.education || undefined,
        bio: profile.bio || undefined,
      },
      cvText // Pass CV text if available
    );

    logInfo('Cover letter generated from text', { 
      userId: req.userId,
      coverLetterLength: coverLetter.length,
      usedCV: !!cvText
    });
    res.json({ coverLetter });
  } catch (error) {
    logError('Error generating cover letter from text', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};

export const generateCoverLetter = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobId || typeof jobId !== 'string' || !validateUUID(jobId)) {
      return res.status(400).json({ error: 'Valid job ID (UUID) is required' });
    }

    // Fetch job and user data from database
    const [job, user] = await Promise.all([
      prisma.jobListing.findUnique({ where: { id: jobId } }),
      prisma.user.findUnique({ 
        where: { id: userId },
        include: { profile: true }
      })
    ]);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = user.profile || {
      skills: [] as string[],
      experience: 0,
      education: null,
      bio: null,
      cvPath: null,
    };

    // Try to parse CV if it exists
    let cvText: string | undefined;
    if (profile && profile.cvPath) {
      try {
        const parsedCV = await cvService.parseCV(profile.cvPath);
        cvText = cvService.formatCVForAI(parsedCV);
        logInfo('CV parsed successfully', { 
          userId: req.userId, 
          cvPath: profile.cvPath,
          cvLength: cvText.length,
          cvPreview: cvText.substring(0, 200) // Log first 200 chars to verify it's being parsed
        });
      } catch (error) {
        logError('Failed to parse CV, using profile instead', error as Error, { userId: req.userId, cvPath: profile.cvPath });
        // Continue without CV, will use profile data
      }
    } else {
      logInfo('No CV path found in profile', { userId: req.userId });
    }

    // Log whether CV text will be used
    logInfo('Generating cover letter', { 
      userId: req.userId, 
      hasCVText: !!cvText,
      cvTextLength: cvText?.length || 0 
    });

    // Log whether CV text will be used
    logInfo('Generating cover letter', { 
      userId: req.userId, 
      hasCVText: !!cvText,
      cvTextLength: cvText?.length || 0,
      jobId: req.body.jobId,
      jobTitle: job.title
    });

    const coverLetter = await getAIService().generateCoverLetter(
      job.title,
      job.company,
      job.description,
      {
        fullName: user.fullName,
        skills: profile.skills || [],
        experience: profile.experience || 0,
        education: profile.education || undefined,
        bio: profile.bio || undefined,
      },
      cvText // Pass CV text if available
    );

    logInfo('Cover letter generated', { 
      userId: req.userId, 
      jobId: req.body.jobId,
      coverLetterLength: coverLetter.length,
      usedCV: !!cvText
    });
    res.json({ coverLetter });
  } catch (error) {
    logError('Error generating cover letter', error as Error, { userId: req.userId, jobId: req.body.jobId });
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};

export const matchJob = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!jobId || typeof jobId !== 'string' || !validateUUID(jobId)) {
      return res.status(400).json({ error: 'Valid job ID (UUID) is required' });
    }

    // Fetch job and user data from database
    const [job, user] = await Promise.all([
      prisma.jobListing.findUnique({ where: { id: jobId } }),
      prisma.user.findUnique({ 
        where: { id: userId },
        include: { profile: true }
      })
    ]);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = user.profile || {
      skills: [] as string[],
    };

    const matchResult = await getAIService().matchJobRelevance(
      job.requirements || [],
      profile.skills || [],
      job.title,
      job.description
    );

    logInfo('Job matched', { userId: req.userId, jobId: req.body.jobId, score: matchResult.score });
    res.json(matchResult);
  } catch (error) {
    logError('Error matching job', error as Error, { userId: req.userId, jobId: req.body.jobId });
    res.status(500).json({ error: 'Failed to match job' });
  }
};

export const suggestImprovements = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;
    const { targetJobs } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = user.profile || {
      skills: [] as string[],
    };

    const suggestions = await getAIService().suggestProfileImprovements(
      profile.skills || [],
      targetJobs || []
    );

    logInfo('Profile suggestions generated', { userId: req.userId, targetJobsCount: (targetJobs || []).length });
    res.json({ suggestions });
  } catch (error) {
    logError('Error generating suggestions', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
};

