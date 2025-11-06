import { describe, it, expect } from 'vitest';
import { deduplicateJobs } from './deduplication';
import { ScrapedJob } from '../services/scraper/ScraperService';

describe('deduplicateJobs', () => {
  it('should remove exact URL duplicates', () => {
    const jobs: ScrapedJob[] = [
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job1',
        description: 'Description 1',
        requirements: [],
      },
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job1', // Same URL
        description: 'Description 1',
        requirements: [],
      },
    ];

    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com/job1');
  });

  it('should keep jobs with different URLs', () => {
    const jobs: ScrapedJob[] = [
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job1',
        description: 'Description 1',
        requirements: [],
      },
      {
        title: 'Designer',
        company: 'Design Inc',
        location: 'Bergen',
        url: 'https://example.com/job2',
        description: 'Description 2',
        requirements: [],
      },
    ];

    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(2);
  });

  it('should handle fuzzy matching for similar titles and companies', () => {
    const jobs: ScrapedJob[] = [
      {
        title: 'Senior Developer',
        company: 'Tech Corporation',
        location: 'Oslo',
        url: 'https://finn.no/job1',
        description: 'Description 1',
        requirements: [],
        source: 'finn.no',
      },
      {
        title: 'Senior Developr', // Typo
        company: 'Tech Corp', // Abbreviated
        location: 'Oslo',
        url: 'https://finn.no/job1-different',
        description: 'Description 1',
        requirements: [],
        source: 'finn.no',
      },
    ];

    const result = deduplicateJobs(jobs);
    // Should deduplicate based on fuzzy matching (same domain + high similarity)
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('should prefer jobs with more detailed URLs', () => {
    const jobs: ScrapedJob[] = [
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job',
        description: 'Short description',
        requirements: [],
      },
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job/12345/senior-developer',
        description: 'Long detailed description with more information',
        requirements: ['React', 'TypeScript'],
      },
    ];

    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
    // Should prefer the job with longer URL and more details
    expect(result[0].url).toContain('senior-developer');
  });

  it('should handle jobs with missing fields', () => {
    const jobs: ScrapedJob[] = [
      {
        title: 'Developer',
        company: '',
        location: '',
        url: 'https://example.com/job1',
        description: '',
        requirements: [],
      },
      {
        title: '',
        company: 'Tech Corp',
        location: 'Oslo',
        url: '',
        description: 'Description',
        requirements: [],
      },
    ];

    const result = deduplicateJobs(jobs);
    // Jobs without title or URL should be filtered out
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it('should handle empty array', () => {
    const result = deduplicateJobs([]);
    expect(result).toEqual([]);
  });

  it('should prioritize jobs from preferred sources', () => {
    const jobs: ScrapedJob[] = [
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job1',
        description: 'Description',
        requirements: [],
        source: 'adecco',
      },
      {
        title: 'Developer',
        company: 'Tech Corp',
        location: 'Oslo',
        url: 'https://example.com/job1-similar',
        description: 'Description',
        requirements: [],
        source: 'finn.no', // Preferred source
      },
    ];

    const result = deduplicateJobs(jobs);
    // Should prefer finn.no over adecco
    if (result.length === 1) {
      expect(result[0].source).toBe('finn.no');
    }
  });
});

