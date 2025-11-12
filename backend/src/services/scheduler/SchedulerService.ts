import { logInfo, logError } from '../../config/logger';
import { FinnNoScraper } from '../scraper/FinnNoScraper';
import { ManpowerScraper } from '../scraper/ManpowerScraper';
import { AdeccoScraper } from '../scraper/AdeccoScraper';
import { ArbeidsplassenScraper } from '../scraper/ArbeidsplassenScraper';
import { KarriereScraper } from '../scraper/KarriereScraper';
import { deduplicateJobs } from '../../utils/deduplication';
import prisma from '../../config/database';
import { ScrapedJob } from '../scraper/ScraperService';
import { jobNotificationService } from '../notification/JobNotificationService';

/**
 * Simple scheduler service for running periodic scraping jobs
 * Uses setInterval for simplicity (can be replaced with node-cron for more complex scheduling)
 */
class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  /**
   * Start scheduled scraping
   * @param intervalMs - Interval in milliseconds (default: 6 hours)
   * @param keywords - Optional keywords to search for
   * @param location - Optional location to search in
   */
  startScheduledScraping(
    intervalMs: number = 6 * 60 * 60 * 1000, // 6 hours default
    keywords?: string,
    location?: string
  ): void {
    if (this.isRunning) {
      logInfo('Scheduled scraping already running', {});
      return;
    }

    this.isRunning = true;
    logInfo('Starting scheduled scraping', { intervalHours: intervalMs / 1000 / 60 / 60, keywords, location });

    // Run immediately on start
    this.runScraping(keywords, location).catch((error) => {
      logError('Error in initial scheduled scrape', error as Error);
    });

    // Then run on interval
    const interval = setInterval(() => {
      this.runScraping(keywords, location).catch((error) => {
        logError('Error in scheduled scrape', error as Error);
      });
    }, intervalMs);

    this.intervals.set('main', interval);
    logInfo('Scheduled scraping started', { intervalMs, nextRun: new Date(Date.now() + intervalMs).toISOString() });
  }

  /**
   * Stop scheduled scraping
   */
  stopScheduledScraping(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    for (const [key, interval] of this.intervals.entries()) {
      clearInterval(interval);
      this.intervals.delete(key);
      logInfo('Stopped scheduled scraping', { key });
    }
  }

  /**
   * Run scraping job
   */
  private async runScraping(keywords?: string, location?: string): Promise<void> {
    const startTime = Date.now();
    logInfo('Running scheduled scraping job', { keywords, location, startTime: new Date().toISOString() });

    try {
      const finnScraper = new FinnNoScraper();
      const manpowerScraper = new ManpowerScraper();
      const adeccoScraper = new AdeccoScraper();
      const arbeidsplassenScraper = new ArbeidsplassenScraper();
      const karriereScraper = new KarriereScraper();

      const allJobs: ScrapedJob[] = [];

      // Scrape from all sources in parallel
      const [finnJobs, manpowerJobs, adeccoJobs, arbeidsplassenJobs, karriereJobs] = await Promise.allSettled([
        finnScraper.scrapeWithFilters(keywords, location),
        manpowerScraper.scrapeWithFilters(keywords, location),
        adeccoScraper.scrapeWithFilters(keywords, location),
        arbeidsplassenScraper.scrapeWithFilters(keywords, location),
        karriereScraper.scrapeWithFilters(keywords, location),
      ]);

      // Handle Finn.no results
      if (finnJobs.status === 'fulfilled') {
        logInfo(`Finn.no scraped ${finnJobs.value.length} jobs`);
        const jobsWithSource = finnJobs.value.map((job) => ({ ...job, source: 'finn.no' }));
        allJobs.push(...jobsWithSource);
      } else {
        logError('Error scraping Finn.no in scheduled job', finnJobs.reason as Error);
      }

      // Handle Manpower results
      if (manpowerJobs.status === 'fulfilled') {
        logInfo(`Manpower scraped ${manpowerJobs.value.length} jobs`);
        const jobsWithSource = manpowerJobs.value.map((job) => ({ ...job, source: 'manpower' }));
        allJobs.push(...jobsWithSource);
      } else {
        logError('Error scraping Manpower in scheduled job', manpowerJobs.reason as Error);
      }

      // Handle Adecco results
      if (adeccoJobs.status === 'fulfilled') {
        logInfo(`Adecco scraped ${adeccoJobs.value.length} jobs`);
        const jobsWithSource = adeccoJobs.value.map((job) => ({ ...job, source: 'adecco' }));
        allJobs.push(...jobsWithSource);
      } else {
        logError('Error scraping Adecco in scheduled job', adeccoJobs.reason as Error);
      }

      // Handle Arbeidsplassen results
      if (arbeidsplassenJobs.status === 'fulfilled') {
        logInfo(`Arbeidsplassen scraped ${arbeidsplassenJobs.value.length} jobs`);
        const jobsWithSource = arbeidsplassenJobs.value.map((job) => ({ ...job, source: 'arbeidsplassen' }));
        allJobs.push(...jobsWithSource);
      } else {
        logError('Error scraping Arbeidsplassen in scheduled job', arbeidsplassenJobs.reason as Error);
      }

      // Handle Karriere results
      if (karriereJobs.status === 'fulfilled') {
        logInfo(`Karriere scraped ${karriereJobs.value.length} jobs`);
        const jobsWithSource = karriereJobs.value.map((job) => ({ ...job, source: 'karriere' }));
        allJobs.push(...jobsWithSource);
      } else {
        logError('Error scraping Karriere in scheduled job', karriereJobs.reason as Error);
      }

      // Deduplicate jobs
      logInfo('Deduplicating jobs', { totalBefore: allJobs.length });
      const uniqueJobs = deduplicateJobs(allJobs);

      const duplicatesRemoved = allJobs.length - uniqueJobs.length;
      if (duplicatesRemoved > 0) {
        logInfo(`Removed ${duplicatesRemoved} duplicate jobs`, {
          totalBefore: allJobs.length,
          totalAfter: uniqueJobs.length,
        });
      }

      // Save to database
      let savedCount = 0;
      let newJobsCount = 0;
      const newJobIds: string[] = [];

      for (const job of uniqueJobs) {
        try {
          // Check if job already exists
          const existing = await prisma.jobListing.findUnique({
            where: { url: job.url },
          });

          const isNew = !existing;

          // Use upsert
          const savedJob = await prisma.jobListing.upsert({
            where: { url: job.url },
            update: {
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              requirements: job.requirements,
              source: job.source || 'unknown',
              scrapedAt: new Date(),
            },
            create: {
              title: job.title,
              company: job.company,
              location: job.location,
              url: job.url,
              description: job.description,
              requirements: job.requirements,
              source: job.source || 'unknown',
              publishedDate: job.publishedDate,
              scrapedAt: new Date(),
            },
          });

          savedCount++;
          if (isNew) {
            newJobsCount++;
            newJobIds.push(savedJob.id);
          }
        } catch (error) {
          logError('Error saving individual job in scheduled scrape', error as Error, {
            jobUrl: job.url,
            jobTitle: job.title,
          });
        }
      }

      // Send notifications about new jobs
      if (newJobIds.length > 0) {
        try {
          logInfo('Sending notifications about new jobs', { newJobsCount: newJobIds.length });
          await jobNotificationService.notifyUsersAboutNewJobs(newJobIds);
          logInfo('Job notifications sent successfully', { notifiedJobsCount: newJobIds.length });
        } catch (error) {
          // Don't fail the entire scraping job if notifications fail
          logError('Error sending job notifications', error as Error, {
            newJobsCount: newJobIds.length,
          });
        }
      }

      const duration = Date.now() - startTime;
      logInfo('Scheduled scraping job completed', {
        totalScraped: uniqueJobs.length,
        saved: savedCount,
        newJobs: newJobsCount,
        keywords,
        location,
        durationMs: duration,
        durationSeconds: Math.round(duration / 1000),
      });
    } catch (error) {
      logError('Error in scheduled scraping job', error as Error, { keywords, location });
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; activeIntervals: number } {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.size,
    };
  }
}

// Singleton instance
export const schedulerService = new SchedulerService();

export default schedulerService;

