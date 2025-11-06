import { logInfo } from '../../config/logger';

/**
 * Simple in-memory cache for scraped jobs
 * Prevents unnecessary re-scraping of the same queries
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL: number = 30 * 60 * 1000; // 30 minutes default

  /**
   * Get cached data for a key
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      logInfo('Cache entry expired', { key });
      return null;
    }

    logInfo('Cache hit', { key });
    return entry.data as T;
  }

  /**
   * Set cached data
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 30 minutes)
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    this.cache.set(key, entry);
    logInfo('Cache entry set', { key, ttl: ttl / 1000 / 60 }); // Log in minutes
  }

  /**
   * Check if a key exists and is valid (not expired)
   * @param key - Cache key
   * @returns true if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a cache entry
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    logInfo('Cache entry deleted', { key });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logInfo('Cache cleared', { entriesCleared: size });
  }

  /**
   * Clear expired entries
   * @returns Number of entries cleared
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      logInfo('Expired cache entries cleared', { count: cleared });
    }

    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const keys = Array.from(this.cache.keys());
    const entries = Array.from(this.cache.values());
    
    const timestamps = entries.map(e => e.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : undefined;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : undefined;

    return {
      size: this.cache.size,
      keys,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  /**
   * Create a cache key from search parameters
   */
  static createJobSearchKey(keywords?: string, location?: string, source?: string): string {
    const parts = [
      'job-search',
      keywords?.toLowerCase().trim() || '',
      location?.toLowerCase().trim() || '',
      source?.toLowerCase().trim() || '',
    ];
    return parts.join(':');
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Auto-cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cacheService.clearExpired();
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default cacheService;

