import { ScraperConfig, ScrapedJob } from './ScraperService';
import { BaseScraper } from './BaseScraper';

export class ManpowerScraper extends BaseScraper {
  constructor() {
    super();
    
    this.config = {
      name: 'Manpower',
      baseUrl: 'https://www.manpower.no/karriere/stillinger',
      selectors: {
        // Improved selectors with fallbacks
        jobList: 'div.job-listing, article.job-card, div[class*="job"], div[class*="position"], div[class*="vacancy"]',
        title: 'h3.job-title, h2.job-title, h3, h2, a[class*="title"], a[href*="stilling"]',
        company: 'div.company-name, span[class*="company"], div[class*="employer"]',
        location: 'div.location, span[class*="location"], div[class*="place"], div[class*="city"]',
        link: 'a.job-link, a[href*="stilling"], a[href*="job"], a[href*="/karriere/"]',
        description: 'div.job-description, p[class*="description"], div[class*="summary"]',
      },
      rateLimit: 2000,
    };
  }

  async scrape(): Promise<ScrapedJob[]> {
    return this.executeScrape(2); // 2 retries
  }

  /**
   * Scrape Manpower with filters (if supported by their website)
   */
  async scrapeWithFilters(keywords?: string, location?: string): Promise<ScrapedJob[]> {
    // Manpower har kanskje ikke søkeparametere i URL - prøv uten filtre hvis vi får Page Not Found
    // Bygg URL med filtre først
    let url = 'https://www.manpower.no/karriere/stillinger';
    const params: string[] = [];
    
    if (keywords && keywords.trim()) {
      // Prøv uten search parameter først - Manpower kan ha egen søkefunksjon
      // params.push(`search=${encodeURIComponent(keywords.trim())}`);
    }
    
    if (location && location.trim()) {
      // Prøv uten location også - siden kan ha egen filtrering
      // params.push(`location=${encodeURIComponent(location.trim())}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    // For nå: Scrape uten URL-parametere (Manpower har kanskje ikke søk i URL)
    this.config.baseUrl = 'https://www.manpower.no/karriere/stillinger';
    
    // TODO: Implementer søk via JavaScript/form submission hvis nødvendig
    // For nå returnerer vi tomt array siden Manpower ikke ser ut til å støtte søk i URL
    
    return this.executeScrape(1);
  }
}

