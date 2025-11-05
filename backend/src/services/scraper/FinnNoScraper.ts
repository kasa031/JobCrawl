import { ScraperConfig, ScrapedJob } from './ScraperService';
import { BaseScraper } from './BaseScraper';
import { logWarn, logInfo } from '../../config/logger';

// Location codes for major Norwegian cities
const LOCATION_CODES: Record<string, string> = {
  'oslo': '0.20061',
  'bergen': '0.20012',
  'trondheim': '0.20016',
  'stavanger': '0.20014',
  'drammen': '0.20020',
  'tromsø': '0.20018',
  'kristiansand': '0.20015',
  'ålesund': '0.20013',
};

export class FinnNoScraper extends BaseScraper {
  constructor() {
    super();
    
    this.config = {
      name: 'Finn.no',
      baseUrl: 'https://www.finn.no/job/fulltime/browse.html',
      selectors: {
        // Oppdaterte selectors for Finn.no - prøv de mest spesifikke først
        jobList: 'article[data-testid="ad-item"], article.ads__unit, article[class*="ads__unit"], article.ads-unit',
        title: 'a.ads__unit__link h2, a[class*="ads__unit__link"] h2, h2 a, a[class*="title"]',
        company: 'div[class*="ads__unit__content__subtitle"], div[class*="company"], span[class*="company"]',
        location: 'div[class*="ads__unit__content__subtitle"], div[class*="location"], span[class*="location"]',
        link: 'a.ads__unit__link, a[href*="/job/fulltime/ad.html"], a[href*="/job/fulltime/ad/"], a[data-testid="ad-item-link"]',
        description: 'div[class*="ads__unit__content__details"], div[class*="description"], p[class*="summary"]',
      },
      rateLimit: 2000, // 2 seconds delay between requests
    };
  }

  async scrape(): Promise<ScrapedJob[]> {
    return this.executeScrape(2); // 2 retries
  }

  /**
   * Scrape Finn.no with search filters
   * Supports both keywords and location filtering
   */
  async scrapeWithFilters(keywords?: string, location?: string): Promise<ScrapedJob[]> {
    // Get location code for known cities
    let locationCode = '';
    if (location) {
      const locationLower = location.toLowerCase();
      for (const [city, code] of Object.entries(LOCATION_CODES)) {
        if (locationLower.includes(city)) {
          locationCode = code;
          break;
        }
      }
    }
    
    // Build URL with browse.html (primary URL structure)
    let url = 'https://www.finn.no/job/fulltime/browse.html';
    const params: string[] = [];
    
    if (keywords && keywords.trim()) {
      params.push(`q=${encodeURIComponent(keywords.trim())}`);
    }
    
    if (locationCode) {
      params.push(`location=${locationCode}`);
    } else if (location && location.trim()) {
      params.push(`location=${encodeURIComponent(location.trim())}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.config.baseUrl = url;
    
    // Try scraping with browse.html
    let jobs = await this.executeScrape(2);
    
    // If no jobs found with browse.html, try search.html
    if (jobs.length === 0 && (keywords || location)) {
      logWarn(`No jobs found with browse.html, trying search.html`, { 
        keywords, 
        location,
        originalUrl: url 
      });
      
      url = 'https://www.finn.no/job/fulltime/search.html';
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      this.config.baseUrl = url;
      jobs = await this.executeScrape(1); // Only 1 retry for fallback
    }
    
    // Hvis fortsatt ingen jobber, prøv uten location filter (kanskje location code er feil)
    if (jobs.length === 0 && locationCode && keywords) {
      logWarn(`No jobs found with location filter, trying without location`, { 
        keywords,
        originalLocation: location
      });
      
      // Prøv uten location
      url = `https://www.finn.no/job/fulltime/browse.html?q=${encodeURIComponent(keywords.trim())}`;
      this.config.baseUrl = url;
      const jobsWithoutLocation = await this.executeScrape(1);
      
      if (jobsWithoutLocation.length > 0) {
        logInfo(`Found jobs without location filter`, { 
          count: jobsWithoutLocation.length,
          keywords 
        });
        return jobsWithoutLocation;
      }
    }
    
    return jobs;
  }
}

