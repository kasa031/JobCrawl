import prisma from '../../config/database';
import nodemailer from 'nodemailer';
import { logInfo, logError } from '../../config/logger';
import { AIService } from '../ai/AIService';

interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  matchScore?: number;
  matchReason?: string;
}

/**
 * Service for sending email notifications about new relevant jobs
 */
class JobNotificationService {
  private aiService: AIService | null = null;

  constructor() {
    // Lazy initialization of AI service
    try {
      this.aiService = new AIService();
    } catch (error) {
      logError('Failed to initialize AI service for job notifications', error as Error);
    }
  }

  /**
   * Send email notifications to users about new relevant jobs
   * @param newJobIds Array of newly created job IDs
   */
  async notifyUsersAboutNewJobs(newJobIds: string[]): Promise<void> {
    if (newJobIds.length === 0) {
      return;
    }

    logInfo('Checking for users to notify about new jobs', { newJobCount: newJobIds.length });

    try {
      // Get all verified users with email notifications enabled
      const users = await prisma.user.findMany({
        where: {
          emailVerified: true,
          // TODO: Add emailNotificationsEnabled field to Profile if needed
        },
        include: {
          profile: true,
        },
      });

      if (users.length === 0) {
        logInfo('No verified users found for job notifications');
        return;
      }

      // Get the new jobs
      const newJobs = await prisma.jobListing.findMany({
        where: {
          id: { in: newJobIds },
        },
      });

      if (newJobs.length === 0) {
        logInfo('No new jobs found for notifications');
        return;
      }

      // For each user, find relevant jobs and send notification
      const notificationPromises = users.map(user => 
        this.notifyUserAboutRelevantJobs(user.id, user.email, user.fullName, user.profile, newJobs)
      );

      await Promise.allSettled(notificationPromises);
      
      logInfo('Job notification process completed', { 
        usersNotified: users.length, 
        newJobsCount: newJobs.length 
      });
    } catch (error) {
      logError('Error in job notification service', error as Error);
    }
  }

  /**
   * Notify a single user about relevant jobs
   */
  private async notifyUserAboutRelevantJobs(
    userId: string,
    userEmail: string,
    userName: string,
    userProfile: any,
    newJobs: any[]
  ): Promise<void> {
    try {
      // Filter relevant jobs based on user profile and preferences
      const relevantJobs = await this.findRelevantJobs(userId, userProfile, newJobs);

      if (relevantJobs.length === 0) {
        logInfo('No relevant jobs found for user', { userId, userEmail });
        return;
      }

      // Send email notification
      await this.sendJobNotificationEmail(userEmail, userName, relevantJobs);

      logInfo('Job notification sent to user', { 
        userId, 
        userEmail, 
        relevantJobsCount: relevantJobs.length 
      });
    } catch (error) {
      logError('Error notifying user about jobs', error as Error, { userId, userEmail });
    }
  }

  /**
   * Find relevant jobs for a user based on their profile
   */
  private async findRelevantJobs(
    _userId: string,
    userProfile: any,
    newJobs: any[]
  ): Promise<JobMatch[]> {
    const relevantJobs: JobMatch[] = [];

    // If user has no profile, skip AI matching but still consider all jobs
    if (!userProfile) {
      // Return first 5 jobs as potentially relevant
      return newJobs.slice(0, 5).map(job => ({
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
      }));
    }

    const userSkills = userProfile.skills || [];
    const userLocation = userProfile.location;

    for (const job of newJobs) {
      let isRelevant = false;
      let matchScore = 0;
      let matchReason = '';

      // Check location match
      if (userLocation && job.location) {
        const locationMatch = job.location.toLowerCase().includes(userLocation.toLowerCase()) ||
                             userLocation.toLowerCase().includes(job.location.toLowerCase());
        if (locationMatch) {
          isRelevant = true;
          matchScore += 30;
          matchReason += 'Lokasjon matcher. ';
        }
      }

      // Check skills match
      if (userSkills.length > 0 && job.requirements && job.requirements.length > 0) {
        const matchingSkills = userSkills.filter((skill: string) => 
          job.requirements.some((req: string) => 
            req.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(req.toLowerCase())
          )
        );
        
        if (matchingSkills.length > 0) {
          isRelevant = true;
          matchScore += matchingSkills.length * 20;
          matchReason += `${matchingSkills.length} ferdigheter matcher. `;
        }
      }

      // Use AI for more sophisticated matching if available
      if (this.aiService && userSkills.length > 0) {
        try {
          const aiMatch = await this.aiService.matchJobRelevance(
            job.description || '',
            userSkills.join(', '),
            job.title,
            job.company
          );
          
          if (aiMatch.score > 50) {
            isRelevant = true;
            matchScore = Math.max(matchScore, aiMatch.score);
            matchReason = aiMatch.explanation || matchReason;
          }
        } catch (error) {
          // If AI matching fails, continue with basic matching
          logError('AI matching failed for job notification', error as Error, { jobId: job.id });
        }
      }

      // If no specific match but user has skills, still consider job if it's in their location
      if (!isRelevant && userLocation && job.location) {
        const locationMatch = job.location.toLowerCase().includes(userLocation.toLowerCase()) ||
                             userLocation.toLowerCase().includes(job.location.toLowerCase());
        if (locationMatch) {
          isRelevant = true;
          matchScore = 20;
          matchReason = 'Ny stilling i ditt område.';
        }
      }

      if (isRelevant) {
        relevantJobs.push({
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          matchScore,
          matchReason: matchReason.trim() || 'Potensielt relevant stilling.',
        });
      }
    }

    // Sort by match score (highest first) and limit to top 10
    return relevantJobs
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 10);
  }

  /**
   * Send email notification to user about relevant jobs
   */
  private async sendJobNotificationEmail(
    userEmail: string,
    userName: string,
    relevantJobs: JobMatch[]
  ): Promise<void> {
    const jobListHtml = relevantJobs
      .map((job, index) => {
        const matchBadge = job.matchScore && job.matchScore > 70 
          ? '<span style="background-color: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">Høy match</span>'
          : job.matchScore && job.matchScore > 50
          ? '<span style="background-color: #FF9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">God match</span>'
          : '';
        
        return `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px; border-left: 4px solid #A67E5A;">
            <h3 style="margin: 0 0 10px 0; color: #2A2018;">
              ${index + 1}. ${job.title} ${matchBadge}
            </h3>
            <p style="margin: 5px 0; color: #6B5439;">
              <strong>Bedrift:</strong> ${job.company}
            </p>
            <p style="margin: 5px 0; color: #6B5439;">
              <strong>Sted:</strong> ${job.location}
            </p>
            ${job.matchReason ? `<p style="margin: 5px 0; color: #4A3F2F; font-style: italic;">${job.matchReason}</p>` : ''}
            <a href="${job.url}" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #A67E5A; color: white; text-decoration: none; border-radius: 4px;">
              Se stilling →
            </a>
          </div>
        `;
      })
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #3D2F1F; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F5ECE2; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E8D5C1; font-size: 12px; color: #6B5439; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #2A2018;">Nye relevante stillinger funnet!</h1>
          </div>
          
          <p>Hei ${userName},</p>
          
          <p>Vi har funnet <strong>${relevantJobs.length}</strong> ${relevantJobs.length === 1 ? 'ny stilling' : 'nye stillinger'} som kan være relevante for deg:</p>
          
          ${jobListHtml}
          
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/JobCrawl/jobs" style="display: inline-block; padding: 12px 24px; background-color: #A67E5A; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Se alle stillinger →
            </a>
          </p>
          
          <div class="footer">
            <p>Dette er en automatisk varsel fra JobCrawl. Du kan endre varsel-innstillinger i din profil.</p>
            <p>© 2026 ms.tery - JobCrawl</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Nye relevante stillinger funnet!

Hei ${userName},

Vi har funnet ${relevantJobs.length} ${relevantJobs.length === 1 ? 'ny stilling' : 'nye stillinger'} som kan være relevante for deg:

${relevantJobs.map((job, index) => `
${index + 1}. ${job.title}
   Bedrift: ${job.company}
   Sted: ${job.location}
   ${job.matchReason ? `Match: ${job.matchReason}` : ''}
   Se stilling: ${job.url}
`).join('\n')}

Se alle stillinger: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/JobCrawl/jobs

Dette er en automatisk varsel fra JobCrawl.
© 2026 ms.tery - JobCrawl
    `;

    try {
      // Create email transporter (similar to email.ts)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025', 10),
        secure: false,
        auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        } : undefined,
        tls: (process.env.SMTP_HOST || 'localhost') === 'localhost' 
          ? { rejectUnauthorized: false } 
          : undefined,
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@jobcrawl.local',
        to: userEmail,
        subject: `🎯 ${relevantJobs.length} ${relevantJobs.length === 1 ? 'ny relevant stilling' : 'nye relevante stillinger'} funnet`,
        html: emailHtml,
        text: emailText,
      });

      logInfo('Job notification email sent', { userEmail, jobsCount: relevantJobs.length });
    } catch (error) {
      logError('Failed to send job notification email', error as Error, { userEmail });
      throw error;
    }
  }
}

export const jobNotificationService = new JobNotificationService();
export default jobNotificationService;

