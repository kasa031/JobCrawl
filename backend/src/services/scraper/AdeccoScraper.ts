import { ScraperConfig, ScrapedJob } from './ScraperService';
import { BaseScraper } from './BaseScraper';

export class AdeccoScraper extends BaseScraper {
  constructor() {
    super();
    
    this.config = {
      name: 'Adecco',
      baseUrl: 'https://www.adecco.no/jobb',
      selectors: {
        // Improved selectors with more fallbacks
        jobList: 'div.job-item, article.job-card, div.job-listing, div[class*="job"], article[class*="job"], div[class*="vacancy"]',
        title: 'h2.job-title, h3.job-title, a.job-title, h2, h3, a[class*="title"]',
        company: 'div.job-company, span.company-name, div[class*="company"], span[class*="employer"]',
        location: 'div.job-location, span.location, div[class*="location"], div[class*="city"], div[class*="place"]',
        link: 'a.job-link, a[href*="/jobb/"], a[href*="job"], a[href*="stilling"]',
        description: 'div.job-description, p.job-summary, div[class*="description"], p[class*="summary"]',
      },
      rateLimit: 2000,
    };
  }

  async scrape(): Promise<ScrapedJob[]> {
    return this.executeScrape(2); // 2 retries
  }

  /**
   * Scrape Adecco with filters (if supported by their website)
   */
  async scrapeWithFilters(keywords?: string, location?: string): Promise<ScrapedJob[]> {
    // Build URL with filters
    let url = 'https://www.adecco.no/jobb';
    const params: string[] = [];
    
    if (keywords && keywords.trim()) {
      params.push(`q=${encodeURIComponent(keywords.trim())}`);
    }
    
    if (location && location.trim()) {
      params.push(`location=${encodeURIComponent(location.trim())}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.config.baseUrl = url;
    return this.executeScrape(2);
  }
}

