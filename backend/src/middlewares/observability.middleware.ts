import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { StructuredLogger } from '../utils/logger';

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = performance.now();
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  
  req.id = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const duration = performance.now() - start;
    const statusCode = res.statusCode;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || 'unknown';

    StructuredLogger.info(
      `${req.method} ${req.originalUrl || req.url} ${statusCode} - ${duration.toFixed(2)}ms`,
      requestId,
      {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode,
        durationMs: parseFloat(duration.toFixed(2)),
        ip,
        userAgent,
      }
    );
  });

  next();
};
