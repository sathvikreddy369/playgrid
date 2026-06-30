import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Centralized error handling middleware.
 * - AppError instances: return the user-facing message with the appropriate status code.
 * - All other errors: log full details server-side, return generic message to client.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unexpected error — log full details, return generic message
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  res.status(500).json({ error: 'Internal Server Error' });
};
