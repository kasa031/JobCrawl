import { Request, Response } from 'express';
import prisma from '../config/database';
import { FinnNoScraper } from '../services/scraper/FinnNoScraper';
import { ManpowerScraper } from '../services/scraper/ManpowerScraper';
import { AdeccoScraper } from '../services/scraper/AdeccoScraper';
import { ArbeidsplassenScraper } from '../services/scraper/ArbeidsplassenScraper';
import { KarriereScraper } from '../services/scraper/KarriereScraper';
import { ScrapedJob } from '../services/scraper/ScraperService';
import { logError, logInfo } from '../config/logger';
import { AIService } from '../services/ai/AIService';
import { deduplicateJobs } from '../utils/deduplication';
import { cacheService, CacheService } from '../services/cache/CacheService';
import { jobNotificationService } from '../services/notification/JobNotificationService';
import { validateKeywords, validateLocation } from '../utils/validation';
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
      // Try to use full-text search if index exists, otherwise fallback to contains
      try {
        // Check if full-text search index exists
        const indexExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'job_listings' 
            AND indexname = 'idx_job_listings_title_description_fts'
          ) as exists
        `;
        
        if (indexExists[0]?.exists) {
          // Use full-text search - convert search terms to tsquery format
          const searchTerms = search
            .split(/\s+/)
            .filter(t => t.length > 0)
            .map(t => t.replace(/[^\wæøåÆØÅ]/g, '')) // Remove special chars
            .filter(t => t.length > 0)
            .join(' & '); // AND operator for all terms
          
          if (searchTerms) {
            // Use raw SQL for full-text search
            const ftsJobs = await prisma.$queryRaw<Array<{
              id: string;
              title: string;
              company: string;
              location: string;
              url: string;
              description: string | null;
              requirements: string[] | null;
              source: string;
              publishedDate: Date | null;
              scrapedAt: Date;
            }>>`
              SELECT * FROM job_listings
              WHERE to_tsvector('norwegian', title || ' ' || COALESCE(description, '')) 
                    @@ to_tsquery('norwegian', ${searchTerms})
              ORDER BY ts_rank(
                to_tsvector('norwegian', title || ' ' || COALESCE(description, '')), 
                to_tsquery('norwegian', ${searchTerms})
              ) DESC, scraped_at DESC
              LIMIT ${limit} OFFSET ${skip}
            `;
            
            const ftsTotal = await prisma.$queryRaw<Array<{ count: bigint }>>`
              SELECT COUNT(*) as count FROM job_listings
              WHERE to_tsvector('norwegian', title || ' ' || COALESCE(description, '')) 
                    @@ to_tsquery('norwegian', ${searchTerms})
            `;
            
            return res.json({
              jobs: ftsJobs,
              pagination: {
                page,
                limit,
                total: Number(ftsTotal[0]?.count || 0),
                pages: Math.ceil(Number(ftsTotal[0]?.count || 0) / limit),
              },
            });
          }
        }
      } catch (ftsError) {
        // If full-text search fails, log and fallback to contains
        logError('Full-text search failed, using fallback', ftsError as Error);
      }
      
      // Fallback to contains search (works without full-text index)
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

    // Validate UUID format
    if (!id || typeof id !== 'string' || !validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid job ID format. Must be a valid UUID.' });
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
    // Validate and sanitize inputs
    const rawKeywords = (typeof req.body?.q === 'string' ? req.body.q : undefined) ||
                        (typeof req.query.q === 'string' ? req.query.q : undefined);
    const rawLocation = (typeof req.body?.location === 'string' ? req.body.location : undefined) ||
                       (typeof req.query.location === 'string' ? req.query.location : undefined);
    
    const keywords = validateKeywords(rawKeywords);
    const location = validateLocation(rawLocation);
    
    // Check cache first
    const cacheKey = CacheService.createJobSearchKey(keywords, location);
    const cachedResult = cacheService.get<{ totalScraped: number; saved: number; durationSeconds: number }>(cacheKey);
    
    if (cachedResult) {
      logInfo('Returning cached job refresh result', { keywords, location, cacheKey });
      return res.json({
        message: 'Jobs refreshed successfully (from cache)',
        ...cachedResult,
        keywords: keywords || null,
        location: location || null,
        cached: true,
      });
    }
    
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
    const arbeidsplassenScraper = new ArbeidsplassenScraper();
    const karriereScraper = new KarriereScraper();

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
    const [manpowerJobs, adeccoJobs, arbeidsplassenJobs, karriereJobs] = await Promise.allSettled([
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
      Promise.race([
        keywords || location 
          ? arbeidsplassenScraper.scrapeWithFilters(keywords || '', location)
          : arbeidsplassenScraper.scrape(),
        new Promise<ScrapedJob[]>((_, reject) => 
          setTimeout(() => reject(new Error('Arbeidsplassen scraping timeout')), 45000)
        ),
      ]),
      Promise.race([
        keywords || location 
          ? karriereScraper.scrapeWithFilters(keywords || '', location)
          : karriereScraper.scrape(),
        new Promise<ScrapedJob[]>((_, reject) => 
          setTimeout(() => reject(new Error('Karriere scraping timeout')), 45000)
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

    // Handle Arbeidsplassen results
    if (arbeidsplassenJobs.status === 'fulfilled') {
      logInfo(`Arbeidsplassen scraped ${arbeidsplassenJobs.value.length} jobs`);
      const jobsWithSource = arbeidsplassenJobs.value.map(job => ({ ...job, source: 'arbeidsplassen' }));
      allJobs.push(...jobsWithSource);
    } else {
      logError('Error scraping Arbeidsplassen', arbeidsplassenJobs.reason as Error);
    }

    // Handle Karriere results
    if (karriereJobs.status === 'fulfilled') {
      logInfo(`Karriere scraped ${karriereJobs.value.length} jobs`);
      const jobsWithSource = karriereJobs.value.map(job => ({ ...job, source: 'karriere' }));
      allJobs.push(...jobsWithSource);
    } else {
      logError('Error scraping Karriere', karriereJobs.reason as Error);
    }

    // Improved deduplication using fuzzy matching algorithm
    logInfo('Deduplicating jobs', { totalBefore: allJobs.length });
    const uniqueJobs = deduplicateJobs(allJobs);
    
    const duplicatesRemoved = allJobs.length - uniqueJobs.length;
    if (duplicatesRemoved > 0) {
      logInfo(`Removed ${duplicatesRemoved} duplicate jobs`, { 
        totalBefore: allJobs.length,
        totalAfter: uniqueJobs.length 
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
        
        // Use upsert - it handles both create and update automatically
        const savedJob = await prisma.jobListing.upsert({
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
        
        savedCount++;
        if (isNew) {
          newJobsCount++;
          newJobIds.push(savedJob.id);
        }
      } catch (error) {
        logError('Error saving individual job', error as Error, { jobUrl: job.url, jobTitle: job.title });
      }
    }
    
    // Send email notifications for new jobs (async, don't wait)
    if (newJobIds.length > 0 && process.env.ENABLE_JOB_NOTIFICATIONS !== 'false') {
      jobNotificationService.notifyUsersAboutNewJobs(newJobIds).catch((error) => {
        logError('Error sending job notifications', error as Error);
      });
    }
    
    // Note: We don't invalidate cache here because we want to cache the result
    // Cache will expire naturally after 20 minutes
    // If user wants fresh data, they can wait for cache to expire or we could add a force refresh parameter
    
    logInfo('Jobs saved to database', { 
      total: uniqueJobs.length, 
      saved: savedCount
    });

    const duration = Date.now() - startTime;
    const durationSeconds = Math.round(duration / 1000);
    
    logInfo('Jobs refreshed', { 
      totalScraped: uniqueJobs.length, 
      saved: savedCount, 
      keywords, 
      location,
      durationMs: duration,
      durationSeconds,
    });
    
    // Cache the result (cache for 20 minutes for job searches)
    const result = {
      totalScraped: uniqueJobs.length,
      saved: savedCount,
      durationSeconds,
    };
    cacheService.set(cacheKey, result, 20 * 60 * 1000); // 20 minutes TTL
    
    res.json({
      message: 'Jobs refreshed successfully',
      ...result,
      keywords: keywords || null,
      location: location || null,
      cached: false,
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

