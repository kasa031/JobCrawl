import { Request, Response, NextFunction } from 'express';
import { logError } from '../config/logger';
import { formatErrorForClient, isOperationalError } from '../utils/errorUtils';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  retryAfter?: number;
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = (err as AppError).statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isOperational = isOperationalError(err);

  // Log error with Winston (more detail for non-operational errors)
  if (!isOperational) {
    logError('Programming Error', err as Error, {
      statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.body,
      params: req.params,
      query: req.query,
      stack: err.stack,
    });
  } else {
    logError('Operational Error', err as Error, {
      statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  // Format error for client
  const errorResponse = formatErrorForClient(err, isDevelopment);

  // Add retry-after header for rate limit errors
  if (statusCode === 429 && (err as AppError).retryAfter) {
    res.setHeader('Retry-After', (err as AppError).retryAfter!.toString());
  }

  res.status(statusCode).json(errorResponse);
};

// Helper to create operational errors
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

