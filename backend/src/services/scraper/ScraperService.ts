import puppeteer, { Browser } from 'puppeteer';
import { logInfo, logError, logWarn } from '../../config/logger';
import {
  jobListSelectors,
} from '../../utils/selectorUtils';

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  requirements: string[];
  publishedDate?: Date;
  source?: string; // e.g., "finn.no", "manpower", "adecco"
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  selectors: {
    jobList: string;
    title: string;
    company: string;
    location: string;
    link: string;
    description?: string;
    requirements?: string;
  };
  rateLimit?: number; // Delay in milliseconds
}

// Singleton pattern for browser instance to avoid creating multiple browsers
export class BrowserManager {
  private static instance: Browser | null = null;
  private static refCount = 0;

  static async getBrowser(): Promise<Browser> {
    if (!this.instance) {
      this.instance = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-extensions',
          '--disable-default-apps',
          '--disable-gpu',
          '--disable-software-rasterizer',
        ],
      });
      this.refCount = 0;
    }
    this.refCount++;
    return this.instance;
  }

  static async releaseBrowser(): Promise<void> {
    this.refCount--;
    // Only close browser if no scrapers are using it
    // In practice, we keep the browser alive for the entire app lifecycle
    // This is more efficient for multiple scrapes
    if (this.refCount <= 0 && this.instance) {
      // Don't actually close - keep browser alive for performance
      // await this.instance.close();
      // this.instance = null;
      // this.refCount = 0;
    }
  }

  static async forceClose(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.close();
        logInfo('Browser closed', { reason: 'forceClose' });
      } catch (error) {
        logError('Error closing browser', error as Error);
      }
      this.instance = null;
      this.refCount = 0;
    }
  }
}

export class ScraperService {
  // Remove isRunning flag - it causes issues with parallel scraping
  // Each scraper instance can run independently

  async initialize(): Promise<void> {
    // Browser is managed by BrowserManager singleton
    await BrowserManager.getBrowser();
  }

  async close(): Promise<void> {
    // Release reference to browser (but don't close it - let it stay alive)
    await BrowserManager.releaseBrowser();
  }

  private async getBrowser(): Promise<Browser> {
    return BrowserManager.getBrowser();
  }

  async scrapeJobs(config: ScraperConfig): Promise<ScrapedJob[]> {
    // Remove isRunning check - allow parallel scraping from different scraper instances
    await this.initialize();
    const browser = await this.getBrowser();

    let page: Awaited<ReturnType<Browser['newPage']>> | null = null;
    try {
      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set realistic user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // Remove webdriver property that can be detected
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });
      
      // Add Chrome properties
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore - Adding chrome property for bot detection evasion
        window.chrome = {
          runtime: {},
        };
      });

      logInfo(`Scraping ${config.name}`, { url: config.baseUrl });
      
      try {
        // Bruk 'networkidle0' for å vente på at nettverket skal være ferdig (bedre enn 'load')
        // Økt timeout til 45000ms for tregere nettverk
        await page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: 45000 });
        logInfo(`Page loaded`, { scraper: config.name });
      } catch (gotoError) {
        logWarn(`Page goto timeout/error, trying with 'load'`, { scraper: config.name, url: config.baseUrl });
        try {
          // Økt timeout også for fallback
          await page.goto(config.baseUrl, { waitUntil: 'load', timeout: 30000 });
          logInfo(`Page loaded (fallback)`, { scraper: config.name });
        } catch (fallbackError) {
          logError(`Failed to load page`, fallbackError as Error, { scraper: config.name, url: config.baseUrl });
          throw fallbackError;
        }
      }
      
      // Vent lenger for at dynamisk innhold skal laste (spesielt viktig for React/Vue-sider som Finn.no)
      // Finn.no bruker JavaScript-rendering som kan ta tid
      await new Promise(resolve => setTimeout(resolve, 5000)); // Økt fra 3s til 5s
      
      // Prøv å vente på at job listings faktisk er lastet inn
      // Sjekk om det finnes noen job-relaterte elementer
      try {
        const hasJobs = await page.evaluate(() => {
          // Prøv å finne noen elementer som kan være jobber
          const possibleJobElements = document.querySelectorAll(
            'article, [data-testid*="ad"], [class*="ad"], [class*="job"], [class*="listing"]'
          );
          return possibleJobElements.length > 0;
        });
        
        if (!hasJobs) {
          logWarn(`No job elements found initially, waiting longer`, { scraper: config.name });
          // Vent litt til hvis ingen jobber funnet
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (evalError) {
        // Ignorer errors i evaluate - fortsett uansett
      }
      
      logInfo(`Waited for dynamic content`, { scraper: config.name });

      // Wait for job listings to load - prøv flere selectors med lengre timeout
      let foundSelector = false;
      const possibleSelectors = [
        config.selectors.jobList,
        ...jobListSelectors.filter(s => s !== config.selectors.jobList),
      ];
      
      for (const selector of possibleSelectors) {
        try {
          // Økt timeout til 8 sekunder for å gi JavaScript mer tid til å laste
          await page.waitForSelector(selector, { timeout: 8000 });
          logInfo(`Found selector`, { scraper: config.name, selector });
          foundSelector = true;
          // Oppdater config.selectors.jobList til den som fungerte
          config.selectors.jobList = selector;
          break;
        } catch {
          // Prøv neste selector
        }
      }
      
      if (!foundSelector) {
        logWarn(`No job selectors found, continuing anyway - page may still be loading`, { scraper: config.name });
      }

      // Set baseUrl in page context for building absolute URLs
      await page.evaluate((baseUrl) => {
        (window as any).__scraperBaseUrl = baseUrl;
      }, config.baseUrl);
      
      // Prøv flere strategier for å finne jobber med robuste fallback-selectors
      const jobs = await page.evaluate((selectors) => {
        // Helper functions (inlined since we can't import in evaluate context)
        const trySelectors = (element: Element | Document, selectorList: string[]): Element | null => {
          for (const sel of selectorList) {
            try {
              const found = element.querySelector(sel);
              if (found) return found;
            } catch {}
          }
          return null;
        };
        
        const extractText = (element: Element, selectorList: string[]): string => {
          const found = trySelectors(element, selectorList);
          return found?.textContent?.trim() || '';
        };
        
        const extractHref = (element: Element, selectorList: string[]): string => {
          const found = trySelectors(element, selectorList);
          if (found instanceof HTMLAnchorElement) return found.href || '';
          if (element instanceof HTMLAnchorElement) return element.href || '';
          return '';
        };

        // Try to find job elements with multiple fallback selectors
        let jobElements = document.querySelectorAll(selectors.jobList);
        
        // If no jobs found with main selector, try fallback selectors
        if (jobElements.length === 0) {
          const fallbackSelectors = [
            'article[data-testid*="ad"]',
            'article[data-testid*="job"]',
            'article.ads__unit',
            'article[class*="ads"]',
            'article[class*="job"]',
            'article',
            'div[class*="job"]',
            'div[class*="ad"]',
            '[data-testid*="job"]',
            '[data-testid*="ad"]',
          ];
          
          for (const altSelector of fallbackSelectors) {
            jobElements = document.querySelectorAll(altSelector);
            if (jobElements.length > 0) break;
          }
        }
        
        const jobs: ScrapedJob[] = [];

        jobElements.forEach((element: Element) => {
          try {
            // Build selector arrays with primary selector first, then fallbacks
            const titleSelectors = selectors.title 
              ? [selectors.title, 'h1', 'h2', 'h3', 'h4', '[class*="title"]', 'a[href*="job"]']
              : ['h1', 'h2', 'h3', 'h4', '[class*="title"]', 'a[href*="job"]'];
            
            const companySelectors = selectors.company
              ? [selectors.company, '[class*="company"]', '[class*="employer"]']
              : ['[class*="company"]', '[class*="employer"]'];
            
            const locationSelectors = selectors.location
              ? [selectors.location, '[class*="location"]', '[class*="place"]']
              : ['[class*="location"]', '[class*="place"]'];
            
            const linkSelectors = selectors.link
              ? [selectors.link, 'a[href*="job"]', 'a[href*="stilling"]', 'a[href]']
              : ['a[href*="job"]', 'a[href*="stilling"]', 'a[href]'];
            
            const descriptionSelectors = selectors.description
              ? [selectors.description, '[class*="description"]', '[class*="summary"]', 'p']
              : ['[class*="description"]', '[class*="summary"]', 'p'];

            // Extract fields with fallback selectors
            const title = extractText(element, titleSelectors);
            const company = extractText(element, companySelectors);
            const location = extractText(element, locationSelectors);
            const link = extractHref(element, linkSelectors);
            const description = extractText(element, descriptionSelectors);

            // Accept jobs with at least title and link (company can be empty)
            if (title && link) {
              // Bygg absolutt URL hvis link er relativ
              let absoluteUrl = link;
              if (!link.startsWith('http')) {
                // Hent baseUrl fra page context (ble satt tidligere)
                const baseUrl = (window as any).__scraperBaseUrl || 'https://www.finn.no';
                
                try {
                  if (link.startsWith('/')) {
                    // Absolutt path - legg til baseUrl domain
                    const urlObj = new URL(baseUrl);
                    absoluteUrl = `${urlObj.protocol}//${urlObj.host}${link}`;
                  } else {
                    // Relativ path - legg til baseUrl
                    absoluteUrl = new URL(link, baseUrl).href;
                  }
                } catch (urlError) {
                  // Hvis URL-bygging feiler, bruk originalen
                  // Logging happens outside evaluate context
                  absoluteUrl = link;
                }
              }
              
              jobs.push({
                title,
                company: company || 'Ikke spesifisert',
                location,
                url: absoluteUrl,
                description,
                requirements: [],
              });
            }
          } catch (error) {
            // Logging happens outside evaluate context
            // Error is caught to prevent one bad job from breaking entire scrape
          }
        });

        return jobs;
      }, config.selectors);

      logInfo(`Found jobs from ${config.name}`, { 
        scraper: config.name, 
        jobCount: jobs.length,
        url: config.baseUrl 
      });
      
      // Log diagnostic info if no jobs found (only in development or when explicitly enabled)
      if (jobs.length === 0 && (process.env.NODE_ENV === 'development' || process.env.ENABLE_SCRAPER_DEBUG === 'true')) {
        logWarn(`No jobs found from ${config.name}`, { 
          scraper: config.name,
          selector: config.selectors.jobList,
          url: config.baseUrl 
        });
        
        // Collect diagnostic information
        try {
          const pageTitle = await page.title();
          const pageContent = await page.content();
          const contentLength = pageContent.length;
          
          // Check if page contains job-related keywords
          const lowerContent = pageContent.toLowerCase();
          const hasJobKeywords = lowerContent.includes('stilling') || 
                                 lowerContent.includes('jobb') ||
                                 lowerContent.includes('søk') ||
                                 lowerContent.includes('annonse');
          
          // Try to find article elements
          const articleCount = await page.evaluate(() => {
            return document.querySelectorAll('article').length;
          });
          
          const isBlocked = lowerContent.includes('captcha') || 
                           lowerContent.includes('bot') || 
                           lowerContent.includes('blocked');
          
          logWarn(`Scraper diagnostic info for ${config.name}`, {
            scraper: config.name,
            pageTitle,
            contentLength,
            hasJobKeywords,
            articleCount,
            isBlocked,
          });
        } catch (debugError: unknown) {
          logError(`Error collecting diagnostic info for ${config.name}`, debugError as Error, { scraper: config.name });
        }
      } else if (jobs.length === 0) {
        // In production, just log a simple warning
        logWarn(`No jobs found from ${config.name}`, { 
          scraper: config.name,
          url: config.baseUrl 
        });
      }

      await page.close();

      // Apply rate limiting
      if (config.rateLimit) {
        await this.delay(config.rateLimit);
      }

      return jobs;
    } catch (error) {
      logError(`Error scraping ${config.name}`, error as Error, { 
        scraper: config.name,
        url: config.baseUrl 
      });
      return [];
    } finally {
      // Ensure page is closed even on error
      // Check if page is still open before trying to close
      if (page) {
        try {
          // Check if page is already closed
          const pageExists = !page.isClosed();
          if (pageExists) {
            await page.close();
          }
        } catch (closeError: any) {
          // Only log if it's not already a "page closed" error
          if (!closeError.message?.includes('closed') && !closeError.message?.includes('target closed')) {
            logError(`Error closing page for ${config.name}`, closeError as Error);
          }
        }
      }
    }
  }

  async scrapeJobDetails(jobUrl: string): Promise<Partial<ScrapedJob>> {
    await this.initialize();
    const browser = await this.getBrowser();

    let page: Awaited<ReturnType<Browser['newPage']>> | null = null;
    try {
      page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.goto(jobUrl, { waitUntil: 'networkidle2' });

      const details = await page.evaluate(() => {
        const getTextContent = (selector: string) => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '';
        };

        return {
          description: getTextContent('.job-description') || getTextContent('[data-testid="job-description"]'),
        };
      });

      await page.close();
      return details;
    } catch (error) {
      logError(`Error scraping job details`, error as Error, { jobUrl });
      return {};
    } finally {
      // Ensure page is closed even on error
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          logError(`Error closing page for job details`, closeError as Error, { jobUrl });
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

