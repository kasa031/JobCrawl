import { AppError, createError } from '../middleware/errorHandler';
import { logError, logWarn } from '../config/logger';

/**
 * Error utility functions for consistent error handling
 */

/**
 * Handle database errors and convert to user-friendly messages
 */
export function handleDatabaseError(error: unknown, _context?: string): AppError {
  const err = error as Error;
  const errorMessage = err.message.toLowerCase();

  // Prisma unique constraint violation
  if (errorMessage.includes('unique constraint') || errorMessage.includes('unique violation')) {
    logWarn('Database unique constraint violation', err);
    return createError('This record already exists', 409);
  }

  // Prisma foreign key constraint violation
  if (errorMessage.includes('foreign key constraint') || errorMessage.includes('foreign key violation')) {
    logWarn('Database foreign key constraint violation', err);
    return createError('Invalid reference to related record', 400);
  }

  // Prisma record not found
  if (errorMessage.includes('record to update not found') || errorMessage.includes('record not found')) {
    logWarn('Database record not found', err);
    return createError('Record not found', 404);
  }

  // Connection errors
  if (errorMessage.includes('connection') || errorMessage.includes('timeout') || errorMessage.includes('econnrefused')) {
    logError('Database connection error', err);
    return createError('Database connection failed. Please try again later.', 503);
  }

  // Generic database error
  logError('Database error', err);
  return createError('Database operation failed', 500);
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  field: string,
  message: string,
  _value?: unknown
): AppError {
  logWarn('Validation error', new Error(`${field}: ${message}`));
  return createError(`Validation failed: ${field} - ${message}`, 400);
}

/**
 * Handle authentication/authorization errors
 */
export function handleAuthError(message: string = 'Unauthorized'): AppError {
  return createError(message, 401);
}

/**
 * Handle not found errors
 */
export function handleNotFoundError(resource: string, id?: string): AppError {
  const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
  return createError(message, 404);
}

/**
 * Handle rate limit errors
 */
export function handleRateLimitError(retryAfter?: number): AppError {
  const error = createError('For mange forespørsler. Vennligst prøv igjen senere.', 429);
  if (retryAfter) {
    (error as any).retryAfter = retryAfter;
  }
  return error;
}

/**
 * Handle file upload errors
 */
export function handleFileUploadError(error: unknown): AppError {
  const err = error as Error;
  const errorMessage = err.message.toLowerCase();

  if (errorMessage.includes('file size') || errorMessage.includes('too large')) {
    return createError('File size exceeds maximum allowed size', 413);
  }

  if (errorMessage.includes('file type') || errorMessage.includes('invalid file')) {
    return createError('Invalid file type. Please check allowed file formats.', 400);
  }

  if (errorMessage.includes('no file') || errorMessage.includes('missing file')) {
    return createError('No file provided', 400);
  }

  logError('File upload error', err);
  return createError('File upload failed', 500);
}

/**
 * Handle AI service errors
 */
export function handleAIError(error: unknown, context?: string): AppError {
  const err = error as Error;
  const errorMessage = err.message.toLowerCase();

  if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
    logError('AI service authentication error', err, { context });
    return createError('AI service authentication failed', 503);
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    logWarn('AI service rate limit', err);
    return createError('AI service rate limit exceeded. Please try again later.', 429);
  }

  if (errorMessage.includes('timeout')) {
    logWarn('AI service timeout', err);
    return createError('AI service request timed out. Please try again.', 504);
  }

  logError('AI service error', err);
  return createError('AI service temporarily unavailable', 503);
}

/**
 * Handle scraping errors
 */
export function handleScrapingError(error: unknown, source?: string): AppError {
  const err = error as Error;
  const errorMessage = err.message.toLowerCase();

  if (errorMessage.includes('timeout') || errorMessage.includes('navigation timeout')) {
    logWarn('Scraping timeout', err);
    return createError(`Scraping timeout for ${source || 'job source'}. Please try again.`, 504);
  }

  if (errorMessage.includes('blocked') || errorMessage.includes('captcha') || errorMessage.includes('bot')) {
    logWarn('Scraping blocked', err);
    return createError(`Scraping blocked for ${source || 'job source'}. Please try again later.`, 403);
  }

  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    logWarn('Scraping page not found', err);
    return createError(`Page not found for ${source || 'job source'}`, 404);
  }

  logError('Scraping error', err);
  return createError(`Failed to scrape ${source || 'job source'}. Please try again later.`, 500);
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof Error) {
    return (error as AppError).isOperational === true;
  }
  return false;
}

/**
 * Format error for client response (hide sensitive info in production)
 */
export function formatErrorForClient(error: unknown, isDevelopment: boolean = false): {
  error: string;
  details?: string;
  code?: string;
} {
  const err = error as AppError | Error;
  const statusCode = (err as AppError).statusCode || 500;

  const response: {
    error: string;
    details?: string;
    code?: string;
  } = {
    error: err.message || 'An error occurred',
  };

  if (isDevelopment) {
    response.details = err.stack;
    if ((err as AppError).statusCode) {
      response.code = `ERR_${statusCode}`;
    }
  } else if (statusCode === 500) {
    // Don't leak internal errors in production
    response.error = 'Internal server error';
  }

  return response;
}

