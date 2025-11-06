import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  withRetry,
  isRetryableError,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
  NETWORK_RETRY_CONFIG,
} from './RetryStrategy';

describe('RetryStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const timeoutError = new Error('Navigation timeout');
      expect(isRetryableError(timeoutError)).toBe(true);

      const networkError = new Error('ECONNRESET');
      expect(isRetryableError(networkError)).toBe(true);

      const protocolError = new Error('Protocol error: Connection closed');
      expect(isRetryableError(protocolError)).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      const validationError = new Error('Invalid input');
      expect(isRetryableError(validationError)).toBe(false);

      const authError = new Error('Unauthorized');
      expect(isRetryableError(authError)).toBe(false);
    });

    it('should handle custom retryable errors', () => {
      const customError = new Error('Custom retryable error');
      expect(isRetryableError(customError, ['custom'])).toBe(true);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateBackoffDelay(0, 1000, 10000, 2)).toBe(1000);
      expect(calculateBackoffDelay(1, 1000, 10000, 2)).toBe(2000);
      expect(calculateBackoffDelay(2, 1000, 10000, 2)).toBe(4000);
      expect(calculateBackoffDelay(3, 1000, 10000, 2)).toBe(8000);
    });

    it('should respect max delay', () => {
      expect(calculateBackoffDelay(10, 1000, 5000, 2)).toBe(5000);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Navigation timeout'))
        .mockResolvedValue('success');
      
      const result = await withRetry(fn, { maxRetries: 2 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Invalid input'));
      
      await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow('Invalid input');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Navigation timeout'));
      
      await expect(withRetry(fn, { maxRetries: 2 })).rejects.toThrow('Navigation timeout');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      await withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
      });
      const duration = Date.now() - startTime;
      
      // Should have waited at least 100ms + 200ms = 300ms
      expect(duration).toBeGreaterThanOrEqual(250);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should pass context to logging', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      await withRetry(fn, {}, 'test-context');
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Config constants', () => {
    it('should have valid default config', () => {
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBeGreaterThan(0);
      expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBeGreaterThan(0);
      expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBeGreaterThan(DEFAULT_RETRY_CONFIG.initialDelayMs);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBeGreaterThan(1);
    });

    it('should have valid network retry config', () => {
      expect(NETWORK_RETRY_CONFIG.maxRetries).toBeGreaterThan(DEFAULT_RETRY_CONFIG.maxRetries);
      expect(NETWORK_RETRY_CONFIG.maxDelayMs).toBeGreaterThan(DEFAULT_RETRY_CONFIG.maxDelayMs);
    });
  });
});

