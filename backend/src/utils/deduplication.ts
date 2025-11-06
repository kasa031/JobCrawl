import { ScrapedJob } from '../services/scraper/ScraperService';

/**
 * Normalize text for comparison (remove special chars, lowercase, trim)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/å/g, 'a')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o');
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
function similarityScore(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);
  
  if (normalized1 === normalized2) return 1.0;
  
  const maxLen = Math.max(normalized1.length, normalized2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(normalized1, normalized2);
  return 1 - (distance / maxLen);
}

/**
 * Check if two jobs are likely duplicates
 */
function areJobsSimilar(job1: ScrapedJob, job2: ScrapedJob): boolean {
  // Exact URL match
  if (job1.url === job2.url) {
    return true;
  }

  // Same domain and similar title
  const domain1 = extractDomain(job1.url);
  const domain2 = extractDomain(job2.url);
  
  if (domain1 && domain2 && domain1 === domain2) {
    const titleSimilarity = similarityScore(job1.title || '', job2.title || '');
    if (titleSimilarity > 0.85) {
      return true;
    }
  }

  // Normalized title + company match
  const title1 = normalizeText(job1.title || '');
  const title2 = normalizeText(job2.title || '');
  const company1 = normalizeText(job1.company || '');
  const company2 = normalizeText(job2.company || '');

  if (title1 && title2 && company1 && company2) {
    // Exact match on normalized title+company
    if (title1 === title2 && company1 === company2) {
      return true;
    }

    // High similarity on both title and company
    const titleSim = similarityScore(job1.title || '', job2.title || '');
    const companySim = similarityScore(job1.company || '', job2.company || '');
    
    if (titleSim > 0.9 && companySim > 0.9) {
      return true;
    }
  }

  return false;
}

/**
 * Deduplicate jobs using improved matching algorithm
 * Returns array of unique jobs, preferring jobs with better data quality
 */
export function deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
  if (jobs.length === 0) return [];

  // Filter out jobs without URL
  const jobsWithUrl = jobs.filter(job => job.url && job.url.trim());
  
  const uniqueJobs: ScrapedJob[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < jobsWithUrl.length; i++) {
    const currentJob = jobsWithUrl[i];
    
    // Skip if already processed
    if (processed.has(currentJob.url)) {
      continue;
    }

    // Find all similar jobs
    const similarJobs: ScrapedJob[] = [currentJob];
    
    for (let j = i + 1; j < jobsWithUrl.length; j++) {
      const otherJob = jobsWithUrl[j];
      
      if (!processed.has(otherJob.url) && areJobsSimilar(currentJob, otherJob)) {
        similarJobs.push(otherJob);
        processed.add(otherJob.url);
      }
    }

    // Choose the best job from similar ones
    // Prefer: longer URL (more specific), has description, has requirements, newer publishedDate
    const bestJob = similarJobs.reduce((best, candidate) => {
      let score = 0;
      
      // URL quality (longer = more specific)
      if (candidate.url.length > best.url.length) score += 10;
      
      // Description quality
      if (candidate.description && candidate.description.length > 100) score += 5;
      if (!best.description || best.description.length <= 100) score += 5;
      
      // Requirements
      if (candidate.requirements && candidate.requirements.length > 0) score += 3;
      if (!best.requirements || best.requirements.length === 0) score += 3;
      
      // Published date (newer is better)
      if (candidate.publishedDate && best.publishedDate) {
        if (candidate.publishedDate > best.publishedDate) score += 2;
      } else if (candidate.publishedDate && !best.publishedDate) {
        score += 2;
      }
      
      // Source preference (finn.no > manpower > adecco)
      const sourcePriority: Record<string, number> = {
        'finn.no': 3,
        'manpower': 2,
        'adecco': 1,
      };
      const candidatePriority = sourcePriority[candidate.source || ''] || 0;
      const bestPriority = sourcePriority[best.source || ''] || 0;
      if (candidatePriority > bestPriority) score += 1;
      
      return score > 0 ? candidate : best;
    });

    uniqueJobs.push(bestJob);
    processed.add(currentJob.url);
  }

  return uniqueJobs;
}

/**
 * Create a unique key for a job (for Map-based deduplication)
 */
export function createJobKey(job: ScrapedJob): string {
  const normalizedTitle = normalizeText(job.title || '');
  const normalizedCompany = normalizeText(job.company || '');
  return `${normalizedTitle}_${normalizedCompany}`;
}

