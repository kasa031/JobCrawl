import { Request, Response } from 'express';
import prisma from '../config/database';
import { FinnNoScraper } from '../services/scraper/FinnNoScraper';
import { ManpowerScraper } from '../services/scraper/ManpowerScraper';
import { AdeccoScraper } from '../services/scraper/AdeccoScraper';
import { ScrapedJob } from '../services/scraper/ScraperService';
import { logError, logInfo } from '../config/logger';
import { AIService } from '../services/ai/AIService';

// Lazy initialization - AIService blir instantiert når den først brukes
// Dette sikrer at dotenv.config() har kjørt først
let aiServiceInstance: AIService | null = null;
const getAIService = () => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    // Validate and sanitize query parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const source = typeof req.query.source === 'string' ? req.query.source.substring(0, 50) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.substring(0, 200) : undefined;
    const location = typeof req.query.location === 'string' ? req.query.location.substring(0, 100) : undefined;

    const skip = (page - 1) * limit;

    // Build where clause with proper types
    const where: {
      source?: string;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        company?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
      location?: { contains: string; mode: 'insensitive' };
    } = {};
    
    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [jobs, total] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scrapedAt: 'desc' },
      }),
      prisma.jobListing.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError('Error fetching jobs', error as Error, { query: req.query });
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Validate UUID format (basic check)
    if (!id || typeof id !== 'string' || id.length > 100) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await prisma.jobListing.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    const jobId = req.params.id;
    logError('Error fetching job', error as Error, { jobId });
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const refreshJobs = async (req: Request, res: Response): Promise<Response | void> => {
  const startTime = Date.now();
  try {
    // Get optional search filters from request body (POST) or query params (fallback)
    const keywords = (typeof req.body?.q === 'string' ? req.body.q : undefined) ||
                     (typeof req.query.q === 'string' ? req.query.q : undefined);
    const location = (typeof req.body?.location === 'string' ? req.body.location : undefined) ||
                     (typeof req.query.location === 'string' ? req.query.location : undefined);
    
    logInfo('Starting job refresh', { keywords, location, startTime: new Date().toISOString() });

    // Use AI to expand search keywords intelligently
    let searchQueries: string[] = [];
    if (keywords && keywords.trim()) {
      try {
        const aiService = getAIService();
        logInfo('Expanding search keywords with AI...', { original: keywords });
        searchQueries = await aiService.expandSearchKeywords(keywords.trim());
        logInfo('AI expanded keywords', { original: keywords, expanded: searchQueries });
      } catch (error) {
        logError('Error expanding keywords with AI, using original', error as Error);
        searchQueries = [keywords.trim()];
      }
    } else {
      searchQueries = [''];
    }

    // Scrape from multiple sources with timeout
    const finnScraper = new FinnNoScraper();
    const manpowerScraper = new ManpowerScraper();
    const adeccoScraper = new AdeccoScraper();

    const allJobs: ScrapedJob[] = [];

    // Scrape Finn.no - bruk bare de 2-3 beste søketermene for raskere resultater
    logInfo('Scraping Finn.no...', { queries: searchQueries.slice(0, 3), location });
    
    // Optimalisering: Scrape med originalt søk + kombiner de viktigste ekspanderte termene
    // Eller scraper bare med originalt søk hvis det er mange termer
    const queriesToScrape = searchQueries.length > 4 ? [searchQueries[0]] : searchQueries.slice(0, 3);
    
    // Scrape all Finn.no queries in parallel for better performance
    const finnPromises = queriesToScrape.map(searchQuery => 
      Promise.race([
        finnScraper.scrapeWithFilters(searchQuery, location),
        new Promise<ScrapedJob[]>((_, reject) => 
          setTimeout(() => reject(new Error(`Finn.no scraping timeout for "${searchQuery}"`)), 35000)
        ),
      ]).catch((error) => {
        logError(`Error scraping Finn.no for query "${searchQuery}"`, error as Error);
        return [] as ScrapedJob[]; // Return empty array on error
      })
    );
    
    const finnResults = await Promise.allSettled(finnPromises);
    for (const result of finnResults) {
      if (result.status === 'fulfilled') {
        const jobsWithSource = result.value.map(job => ({ ...job, source: 'finn.no' }));
        allJobs.push(...jobsWithSource);
        logInfo(`Finn.no scraped ${result.value.length} jobs`, { 
          query: queriesToScrape[finnResults.indexOf(result)],
          location 
        });
      }
    }

    // Scrape other sources with filters if provided
    // Run in parallel for better performance
    const [manpowerJobs, adeccoJobs] = await Promise.allSettled([
      Promise.race([
        keywords || location 
          ? manpowerScraper.scrapeWithFilters(keywords || '', location)
          : manpowerScraper.scrape(),
        new Promise<ScrapedJob[]>((_, reject) => 
          setTimeout(() => reject(new Error('Manpower scraping timeout')), 45000)
        ),
      ]),
      Promise.race([
        keywords || location 
          ? adeccoScraper.scrapeWithFilters(keywords || '', location)
          : adeccoScraper.scrape(),
        new Promise<ScrapedJob[]>((_, reject) => 
          setTimeout(() => reject(new Error('Adecco scraping timeout')), 60000)
        ),
      ]),
    ]);

    // Handle Manpower results
    if (manpowerJobs.status === 'fulfilled') {
      logInfo(`Manpower scraped ${manpowerJobs.value.length} jobs`);
      const jobsWithSource = manpowerJobs.value.map(job => ({ ...job, source: 'manpower' }));
      allJobs.push(...jobsWithSource);
    } else {
      logError('Error scraping Manpower', manpowerJobs.reason as Error);
    }

    // Handle Adecco results
    if (adeccoJobs.status === 'fulfilled') {
      logInfo(`Adecco scraped ${adeccoJobs.value.length} jobs`);
      const jobsWithSource = adeccoJobs.value.map(job => ({ ...job, source: 'adecco' }));
      allJobs.push(...jobsWithSource);
    } else {
      logError('Error scraping Adecco', adeccoJobs.reason as Error);
    }

    // Remove duplicates based on URL, and also by title+company combination
    // This catches duplicates that might have slightly different URLs
    const uniqueJobsByUrl = new Map<string, ScrapedJob>();
    const uniqueJobsByTitleCompany = new Map<string, ScrapedJob>();
    
    for (const job of allJobs) {
      // Primary deduplication: by URL
      if (!uniqueJobsByUrl.has(job.url)) {
        uniqueJobsByUrl.set(job.url, job);
      }
      
      // Secondary deduplication: by title+company (normalized)
      const titleCompanyKey = `${(job.title || '').toLowerCase().trim()}_${(job.company || '').toLowerCase().trim()}`;
      if (!uniqueJobsByTitleCompany.has(titleCompanyKey)) {
        uniqueJobsByTitleCompany.set(titleCompanyKey, job);
      } else {
        // If we found a duplicate by title+company, prefer the one with better URL
        const existing = uniqueJobsByTitleCompany.get(titleCompanyKey);
        if (existing && (job.url.length > existing.url.length || job.url.includes('http'))) {
          uniqueJobsByTitleCompany.set(titleCompanyKey, job);
        }
      }
    }
    
    // Combine both deduplication strategies - prefer URL-based but include title+company matches
    const uniqueJobs = Array.from(uniqueJobsByUrl.values());

    // Log how many jobs were filtered due to missing URL
    const jobsWithUrl = allJobs.filter(job => job.url && job.url.trim());
    const jobsWithoutUrl = allJobs.length - jobsWithUrl.length;
    if (jobsWithoutUrl > 0) {
      logInfo(`Filtered out ${jobsWithoutUrl} jobs without URL`, { totalScraped: allJobs.length });
    }

    // Save to database
    let savedCount = 0;
    
    for (const job of uniqueJobs) {
      try {
        // Use upsert - it handles both create and update automatically
        await prisma.jobListing.upsert({
          where: { url: job.url },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            requirements: job.requirements,
            source: job.source || 'unknown',
            scrapedAt: new Date(), // Update scraped timestamp
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
        
        // Count based on whether this was a new record (check if scrapedAt is very recent)
        // We can't easily tell from upsert result, so we'll just count total
        savedCount++;
      } catch (error) {
        logError('Error saving individual job', error as Error, { jobUrl: job.url, jobTitle: job.title });
      }
    }
    
    logInfo('Jobs saved to database', { 
      total: uniqueJobs.length, 
      saved: savedCount
    });

    const duration = Date.now() - startTime;
    logInfo('Jobs refreshed', { 
      totalScraped: uniqueJobs.length, 
      saved: savedCount, 
      keywords, 
      location,
      durationMs: duration,
      durationSeconds: Math.round(duration / 1000),
    });
    
    res.json({
      message: 'Jobs refreshed successfully',
      totalScraped: uniqueJobs.length,
      saved: savedCount,
      keywords: keywords || null,
      location: location || null,
      durationSeconds: Math.round(duration / 1000),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const keywords = (typeof req.body?.q === 'string' ? req.body.q : undefined) ||
                     (typeof req.query.q === 'string' ? req.query.q : undefined);
    const location = (typeof req.body?.location === 'string' ? req.body.location : undefined) ||
                     (typeof req.query.location === 'string' ? req.query.location : undefined);
    logError('Error refreshing jobs', error as Error, { 
      durationMs: duration,
      keywords,
      location,
    });
    res.status(500).json({ error: 'Failed to refresh jobs' });
  }
};

