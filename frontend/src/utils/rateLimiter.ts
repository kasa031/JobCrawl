/**
 * Simple in-memory rate limiter for frontend API calls
 * Prevents spam and excessive API requests
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly defaultWindowMs: number = 60000; // 1 minute
  private readonly defaultMaxRequests: number = 30; // 30 requests per minute

  /**
   * Check if a request is allowed
   * @param key - Unique identifier for the rate limit (e.g., endpoint + userId)
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(
    key: string,
    maxRequests: number = this.defaultMaxRequests,
    windowMs: number = this.defaultWindowMs
  ): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);

    // If no entry exists or window has expired, create new entry
    if (!entry || now > entry.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    // If within window, increment count
    if (entry.count < maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining requests in current window
   * @param key - Unique identifier for the rate limit
   * @param maxRequests - Maximum number of requests allowed
   * @param _windowMs - Time window in milliseconds (unused but kept for API consistency)
   * @returns Number of remaining requests, or -1 if window expired
   */
  getRemaining(
    key: string,
    maxRequests: number = this.defaultMaxRequests,
    _windowMs: number = this.defaultWindowMs
  ): number {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   * @param key - Unique identifier for the rate limit
   * @returns Time until reset in milliseconds, or 0 if no active limit
   */
  getResetTime(key: string): number {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      return 0;
    }

    return entry.resetTime - now;
  }

  /**
   * Clear rate limit for a specific key
   * @param key - Unique identifier for the rate limit
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration for different endpoints
 */
export const rateLimitConfig: Record<string, { maxRequests: number; windowMs: number }> = {
  // Auth endpoints - more restrictive
  '/auth/login': { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  '/auth/register': { maxRequests: 3, windowMs: 60000 }, // 3 per minute
  
  // Job refresh - very restrictive (expensive operation)
  '/jobs/refresh': { maxRequests: 2, windowMs: 120000 }, // 2 per 2 minutes
  
  // AI endpoints - restrictive (expensive)
  '/ai/cover-letter': { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  '/ai/match': { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  
  // Bulk operations - restrictive
  '/applications/bulk': { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  
  // Default for other endpoints
  default: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
};

/**
 * Get rate limit config for an endpoint
 */
export const getRateLimitConfig = (endpoint: string): { maxRequests: number; windowMs: number } => {
  // Check for exact match first
  if (rateLimitConfig[endpoint]) {
    return rateLimitConfig[endpoint];
  }

  // Check for prefix match (e.g., /applications/bulk matches /applications/bulk/delete)
  for (const [key, config] of Object.entries(rateLimitConfig)) {
    if (endpoint.startsWith(key)) {
      return config;
    }
  }

  // Return default
  return rateLimitConfig.default;
};

/**
 * Create a rate limit key from endpoint and optional user identifier
 */
export const createRateLimitKey = (endpoint: string, userId?: string): string => {
  if (userId) {
    return `${endpoint}:${userId}`;
  }
  return endpoint;
};

/**
 * Check if a request is rate limited
 * @param endpoint - API endpoint
 * @param userId - Optional user ID for per-user rate limiting
 * @returns Object with isAllowed boolean and optional error message
 */
export const checkRateLimit = (
  endpoint: string,
  userId?: string
): { isAllowed: boolean; error?: string; retryAfter?: number } => {
  const config = getRateLimitConfig(endpoint);
  const key = createRateLimitKey(endpoint, userId);

  const isAllowed = rateLimiter.isAllowed(key, config.maxRequests, config.windowMs);

  if (!isAllowed) {
    const retryAfter = Math.ceil(rateLimiter.getResetTime(key) / 1000); // Convert to seconds
    return {
      isAllowed: false,
      error: `For mange forespørsler. Prøv igjen om ${retryAfter} sekunder.`,
      retryAfter,
    };
  }

  return { isAllowed: true };
};

export default rateLimiter;

