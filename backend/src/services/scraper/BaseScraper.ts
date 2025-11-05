import { ScraperService, ScraperConfig, ScrapedJob } from './ScraperService';
import { logInfo, logError } from '../../config/logger';

/**
 * Base class for all scrapers with common functionality
 */
export abstract class BaseScraper {
  protected scraperService: ScraperService;
  protected config!: ScraperConfig; // Definite assignment - set in subclasses

  constructor() {
    this.scraperService = new ScraperService();
  }

  /**
   * Validate scraped job data
   */
  protected validateJob(job: Partial<ScrapedJob>): boolean {
    // Minimum requirements: title and URL
    if (!job.title || typeof job.title !== 'string' || job.title.trim().length < 3) {
      return false;
    }
    if (!job.url || typeof job.url !== 'string' || job.url.trim().length < 10) {
      return false;
    }
    // URL should be valid and start with http/https
    try {
      const url = new URL(job.url.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
      }
      // Check that domain is reasonable (at least has a TLD)
      if (!url.hostname || url.hostname.split('.').length < 2) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean and sanitize job data
   */
  protected sanitizeJob(job: ScrapedJob): ScrapedJob {
    // Normalize and clean URL
    let cleanUrl = (job.url || '').trim();
    try {
      const url = new URL(cleanUrl);
      // Remove common tracking parameters
      url.searchParams.delete('utm_source');
      url.searchParams.delete('utm_medium');
      url.searchParams.delete('utm_campaign');
      url.searchParams.delete('ref');
      cleanUrl = url.toString();
    } catch {
      // If URL parsing fails, use original (validation should have caught this)
    }
    
    return {
      title: (job.title || '').trim().substring(0, 200),
      company: (job.company || 'Ikke spesifisert').trim().substring(0, 100),
      location: (job.location || '').trim().substring(0, 100),
      url: cleanUrl,
      description: (job.description || '').trim().substring(0, 5000),
      requirements: (job.requirements || [])
        .filter(r => r && typeof r === 'string' && r.trim().length > 0)
        .map(r => r.trim().substring(0, 200))
        .slice(0, 20),
      publishedDate: job.publishedDate,
    };
  }

  /**
   * Abstract method that each scraper must implement
   */
  abstract scrape(): Promise<ScrapedJob[]>;

  /**
   * Optional: Scrape with filters (keywords, location)
   * Default implementation just calls scrape()
   */
  async scrapeWithFilters(_keywords?: string, _location?: string): Promise<ScrapedJob[]> {
    return this.scrape();
  }

  /**
   * Main scraping method with error handling and retry logic
   */
  protected async executeScrape(retries: number = 2): Promise<ScrapedJob[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.scraperService.initialize();
        const jobs = await this.scraperService.scrapeJobs(this.config);
        
        // Validate and sanitize jobs
        const validJobs = jobs
          .filter(job => this.validateJob(job))
          .map(job => this.sanitizeJob(job))
          .map(job => ({
            ...job,
            source: this.config.name.toLowerCase(),
          }));
        
        // Close browser reference after successful scrape
        await this.scraperService.close();
        return validJobs;
      } catch (error) {
        lastError = error as Error;
        logError(`Error in ${this.config.name} scraper`, error as Error, {
          attempt: attempt + 1,
          maxAttempts: retries + 1,
          scraperName: this.config.name,
        });
        
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          logInfo(`Retrying ${this.config.name}`, { waitTimeMs: waitTime, attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Release browser reference on final failure
          await this.scraperService.close();
        }
      }
    }
    
    // All retries failed
    logError(`All retries failed for ${this.config.name}`, lastError || new Error('Unknown error'), {
      scraperName: this.config.name,
      totalAttempts: retries + 1,
    });
    return [];
  }
}

