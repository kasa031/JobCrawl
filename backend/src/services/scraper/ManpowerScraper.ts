import { ScrapedJob } from './ScraperService';
import { BaseScraper } from './BaseScraper';
import { logInfo, logWarn } from '../../config/logger';
import { BrowserManager } from './ScraperService';

export class ManpowerScraper extends BaseScraper {
  constructor() {
    super();
    
    this.config = {
      name: 'Manpower',
      baseUrl: 'https://www.manpower.no/karriere/stillinger',
      selectors: {
        // Improved selectors with fallbacks
        jobList: 'div.job-listing, article.job-card, div[class*="job"], div[class*="position"], div[class*="vacancy"], article, div[data-testid*="job"]',
        title: 'h3.job-title, h2.job-title, h3, h2, a[class*="title"], a[href*="stilling"], h4',
        company: 'div.company-name, span[class*="company"], div[class*="employer"], span[class*="employer"]',
        location: 'div.location, span[class*="location"], div[class*="place"], div[class*="city"], span[class*="city"]',
        link: 'a.job-link, a[href*="stilling"], a[href*="job"], a[href*="/karriere/"], a[href*="/job"]',
        description: 'div.job-description, p[class*="description"], div[class*="summary"], p',
      },
      rateLimit: 2000,
    };
  }

  async scrape(): Promise<ScrapedJob[]> {
    return this.executeScrape(2); // 2 retries
  }

  /**
   * Scrape Manpower with filters using JavaScript form submission
   */
  async scrapeWithFilters(keywords?: string, location?: string): Promise<ScrapedJob[]> {
    // Use custom scraping with form submission if filters are provided
    if (keywords || location) {
      return this.scrapeWithFormSubmission(keywords, location);
    }
    
    // Otherwise use standard scraping
    return this.executeScrape(1);
  }

  /**
   * Scrape Manpower using JavaScript form submission for search
   */
  private async scrapeWithFormSubmission(keywords?: string, location?: string): Promise<ScrapedJob[]> {
    await this.scraperService.initialize();
    const browser = await BrowserManager.getBrowser();
    let page: Awaited<ReturnType<typeof browser.newPage>> | null = null;

    try {
      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Remove webdriver property
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });

      // Add Chrome properties
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        window.chrome = {
          runtime: {},
        };
      });

      logInfo('Navigating to Manpower', { url: this.config.baseUrl });
      
      try {
        await page.goto(this.config.baseUrl, { waitUntil: 'networkidle0', timeout: 45000 });
      } catch (gotoError) {
        logWarn('Page goto timeout, trying with load', {});
        await page.goto(this.config.baseUrl, { waitUntil: 'load', timeout: 30000 });
      }

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Try to find and fill search form
      if (keywords || location) {
        logInfo('Attempting to fill search form', { keywords, location });
        
        try {
          // Try multiple possible selectors for search inputs
          const searchSelectors = [
            'input[type="search"]',
            'input[name*="search"]',
            'input[id*="search"]',
            'input[placeholder*="søk"]',
            'input[placeholder*="search"]',
            'input[class*="search"]',
          ];

          let searchInput: any = null;
          for (const selector of searchSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 5000 });
              searchInput = await page.$(selector);
              if (searchInput) {
                logInfo('Found search input', { selector });
                break;
              }
            } catch {
              // Continue to next selector
            }
          }

          if (searchInput && keywords) {
            await searchInput.type(keywords, { delay: 100 });
            logInfo('Typed keywords into search', { keywords });
            
            // Wait a bit for autocomplete or suggestions
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Try to submit form or click search button
            const submitSelectors = [
              'button[type="submit"]',
              'button[class*="search"]',
              'button[id*="search"]',
              'input[type="submit"]',
              'button:has-text("Søk")',
              'button:has-text("Search")',
            ];

            for (const selector of submitSelectors) {
              try {
                const submitButton = await page.$(selector);
                if (submitButton) {
                  await submitButton.click();
                  logInfo('Clicked search button', { selector });
                  break;
                }
              } catch {
                // Continue to next selector
              }
            }

            // Wait for results to load
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

          // Try location filter if provided
          if (location) {
            const locationSelectors = [
              'input[name*="location"]',
              'input[id*="location"]',
              'input[placeholder*="sted"]',
              'input[placeholder*="location"]',
              'select[name*="location"]',
              'select[id*="location"]',
            ];

            for (const selector of locationSelectors) {
              try {
                const locationInput = await page.$(selector);
                if (locationInput) {
                  await locationInput.type(location, { delay: 100 });
                  logInfo('Filled location', { location });
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  break;
                }
              } catch {
                // Continue to next selector
              }
            }
          }
        } catch (formError) {
          logWarn('Could not fill search form, continuing with page as-is', { error: (formError as Error).message });
        }
      }

      // Now scrape jobs from the page
      const jobs = await page.evaluate((selectors) => {
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

        // Try to find job elements
        let jobElements = document.querySelectorAll(selectors.jobList);
        
        if (jobElements.length === 0) {
          const fallbackSelectors = [
            'article',
            'div[class*="job"]',
            'div[class*="position"]',
            'div[class*="vacancy"]',
            '[data-testid*="job"]',
          ];
          
          for (const altSelector of fallbackSelectors) {
            jobElements = document.querySelectorAll(altSelector);
            if (jobElements.length > 0) break;
          }
        }
        
        const jobs: ScrapedJob[] = [];

        jobElements.forEach((element: Element) => {
          try {
            const titleSelectors = selectors.title 
              ? [selectors.title, 'h1', 'h2', 'h3', 'h4', '[class*="title"]']
              : ['h1', 'h2', 'h3', 'h4', '[class*="title"]'];
            
            const companySelectors = selectors.company
              ? [selectors.company, '[class*="company"]', '[class*="employer"]']
              : ['[class*="company"]', '[class*="employer"]'];
            
            const locationSelectors = selectors.location
              ? [selectors.location, '[class*="location"]', '[class*="place"]']
              : ['[class*="location"]', '[class*="place"]'];
            
            const linkSelectors = selectors.link
              ? [selectors.link, 'a[href*="stilling"]', 'a[href*="job"]', 'a[href]']
              : ['a[href*="stilling"]', 'a[href*="job"]', 'a[href]'];
            
            const descriptionSelectors = selectors.description
              ? [selectors.description, '[class*="description"]', '[class*="summary"]', 'p']
              : ['[class*="description"]', '[class*="summary"]', 'p'];

            const title = extractText(element, titleSelectors);
            const company = extractText(element, companySelectors);
            const location = extractText(element, locationSelectors);
            const link = extractHref(element, linkSelectors);
            const description = extractText(element, descriptionSelectors);

            if (title && link) {
              let absoluteUrl = link;
              if (!link.startsWith('http')) {
                const baseUrl = 'https://www.manpower.no';
                try {
                  if (link.startsWith('/')) {
                    const urlObj = new URL(baseUrl);
                    absoluteUrl = `${urlObj.protocol}//${urlObj.host}${link}`;
                  } else {
                    absoluteUrl = new URL(link, baseUrl).href;
                  }
                } catch {
                  absoluteUrl = link;
                }
              }
              
              jobs.push({
                title,
                company: company || 'Manpower',
                location,
                url: absoluteUrl,
                description,
                requirements: [],
              });
            }
          } catch (error) {
            // Ignore errors for individual jobs
          }
        });

        return jobs;
      }, this.config.selectors);

      logInfo(`Manpower scraped ${jobs.length} jobs`, { keywords, location });

      // Validate and sanitize jobs
      const validJobs = jobs
        .filter(job => this.validateJob(job))
        .map(job => this.sanitizeJob(job))
        .map(job => ({
        ...job,
        source: 'manpower',
      }));

      await this.scraperService.close();
      return validJobs;
    } catch (error) {
      logWarn('Error in Manpower form submission scraping', error as Error);
      await this.scraperService.close();
      // Fallback to standard scraping
      return this.executeScrape(1);
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch {
          // Ignore close errors
        }
      }
    }
  }
}

