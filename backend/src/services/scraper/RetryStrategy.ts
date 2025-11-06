import { logWarn, logInfo } from '../../config/logger';

/**
 * Retry strategy configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'timeout',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'Protocol error',
    'Navigation timeout',
    'Target closed',
  ],
};

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error | unknown, retryableErrors?: string[]): boolean {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const errors = retryableErrors || DEFAULT_RETRY_CONFIG.retryableErrors || [];
  
  return errors.some(retryableError => errorMessage.includes(retryableError.toLowerCase()));
}

/**
 * Calculate delay for exponential backoff
 */
export function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number
): number {
  const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelayMs);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: string
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateBackoffDelay(
          attempt - 1,
          retryConfig.initialDelayMs,
          retryConfig.maxDelayMs,
          retryConfig.backoffMultiplier
        );
        
        logInfo(`Retrying operation${context ? ` (${context})` : ''}`, {
          attempt,
          maxRetries: retryConfig.maxRetries,
          delayMs: delay,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error, retryConfig.retryableErrors)) {
        logWarn(`Non-retryable error encountered${context ? ` (${context})` : ''}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt >= retryConfig.maxRetries) {
        logWarn(`Max retries reached${context ? ` (${context})` : ''}`, {
          maxRetries: retryConfig.maxRetries,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Unknown error in retry logic');
}

/**
 * Retry strategy for network operations
 */
export const NETWORK_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'timeout',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'Protocol error',
    'Navigation timeout',
    'Target closed',
    'net::ERR_',
  ],
};

/**
 * Retry strategy for page operations
 */
export const PAGE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'Protocol error',
    'Target closed',
    'Navigation timeout',
    'waiting for selector',
    'element not found',
  ],
};

