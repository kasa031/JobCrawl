import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logWarn } from '../config/logger';

// CSRF token storage (in-memory, use Redis in production)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Store CSRF token (valid for 1 hour)
export const storeCSRFToken = (sessionId: string, token: string): void => {
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 3600000, // 1 hour
  });
};

// Verify CSRF token
export const verifyCSRFToken = (sessionId: string, token: string): boolean => {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
};

// CSRF protection middleware (optional - can be enabled per route)
// Note: For API-only applications, CSRF is less critical since we use JWT tokens
// This is mainly for form submissions if we add traditional HTML forms
export const csrfProtection = (req: Request, _res: Response, next: NextFunction): Response | void => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API endpoints that use JWT (already protected)
  // CSRF is mainly for cookie-based sessions
  // For now, we'll skip CSRF since we use JWT tokens
  // This middleware is here for future use if we add cookie-based sessions
  // Uncomment below to enable CSRF protection:
  /*
  const token = req.headers['x-csrf-token'] as string;
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'unknown';
  if (!token || !verifyCSRFToken(sessionId, token)) {
    logWarn('CSRF token validation failed', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  */
  
  next();
};

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logWarn('CSRF token cleanup', { entriesRemoved: cleaned, remaining: csrfTokens.size });
  }
}, 3600000); // Run cleanup every hour

