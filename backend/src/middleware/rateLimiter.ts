import { Request, Response, NextFunction } from 'express';
import { logWarn, logInfo } from '../config/logger';

// Enhanced in-memory rate limiter with per-endpoint limits
// For production, consider using Redis for distributed rate limiting
interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstRequestTime: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

// Different rate limits for different endpoint types
const RATE_LIMITS: Record<string, { window: number; max: number }> = {
  // Authentication endpoints - stricter limits
  '/api/auth/login': { window: 60000, max: 5 }, // 5 per minute
  '/api/auth/register': { window: 60000, max: 3 }, // 3 per minute
  '/api/auth/verify': { window: 60000, max: 10 }, // 10 per minute
  
  // Job scraping - very strict to prevent abuse
  '/api/jobs/refresh': { window: 120000, max: 2 }, // 2 per 2 minutes
  
  // AI endpoints - moderate limits
  '/api/ai/cover-letter': { window: 60000, max: 10 }, // 10 per minute
  '/api/ai/match': { window: 60000, max: 20 }, // 20 per minute
  
  // Bulk operations - strict limits
  '/api/applications/bulk': { window: 60000, max: 5 }, // 5 per minute
  
  // Default for other endpoints
  default: { window: 60000, max: 100 }, // 100 per minute
};

const getRateLimit = (path: string): { window: number; max: number } => {
  // Check for exact match first
  if (RATE_LIMITS[path]) {
    return RATE_LIMITS[path];
  }
  
  // Check for prefix match (e.g., /api/applications/bulk/delete)
  for (const [endpoint, limit] of Object.entries(RATE_LIMITS)) {
    if (path.startsWith(endpoint)) {
      return limit;
    }
  }
  
  return RATE_LIMITS.default;
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const path = req.path || req.url || '';
  const now = Date.now();
  
  const limit = getRateLimit(path);
  const key = `${ip}:${path}`;

  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(key, {
      count: 1,
      resetTime: now + limit.window,
      firstRequestTime: now,
    });
    return next();
  }

  if (record.count >= limit.max) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    logWarn('Rate limit exceeded', {
      ip,
      path,
      count: record.count,
      max: limit.max,
      retryAfter,
    });
    
    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', limit.max.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter,
      limit: limit.max,
      window: limit.window / 1000, // in seconds
    });
  }

  // Increment counter
  record.count++;
  requestCounts.set(key, record);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', limit.max.toString());
  res.setHeader('X-RateLimit-Remaining', (limit.max - record.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
  
  next();
};

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logInfo('Rate limiter cleanup', { entriesRemoved: cleaned, remaining: requestCounts.size });
  }
}, 60000); // Run cleanup every minute


