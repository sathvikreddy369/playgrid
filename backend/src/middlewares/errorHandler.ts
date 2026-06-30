import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { StructuredLogger } from '../utils/logger';
import { randomUUID } from 'crypto';

/**
 * Centralized error handling middleware.
 * - AppError instances: return the user-facing message with the appropriate status code.
 * - All other errors: log structured details (with Error ID and Request ID) and return Error ID to client.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.id;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Generate unique Error ID for tracing
  const errorId = randomUUID();

  // Structured Error Logging
  StructuredLogger.error(
    `Unhandled error: ${err.message}`,
    requestId,
    {
      errorId,
      errorName: err.name,
      stack: err.stack,
      method: req.method,
      path: req.originalUrl || req.url,
      query: req.query,
      body: req.body,
    }
  );

  res.status(500).json({ 
    error: 'Internal Server Error',
    errorId, // Returned to client for reporting
  });
};
