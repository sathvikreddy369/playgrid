import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { observabilityMiddleware } from './middlewares/observability.middleware';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import communityRoutes from './routes/community.routes';
import groundRoutes from './routes/ground.routes';
import matchRoutes from './routes/match.routes';
import notificationRoutes from './routes/notification.routes';
import messageRoutes from './routes/message.routes';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/report.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import http from 'http';
import { initializeSocket } from './socket';
import { errorHandler } from './middlewares/errorHandler';
import prisma from './utils/db';
import { StructuredLogger } from './utils/logger';

import { apiLimiter } from './middlewares/rateLimiter';
// @ts-ignore - xss-clean has no types, but we'll try with types or ignore it
import xss from 'xss-clean';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Allowed origins for CORS
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');

// Middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(helmet());
app.use(observabilityMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Security Protections
app.use(xss()); // Sanitize req.body, req.query, req.params
app.use('/api', apiLimiter); // Apply general rate limit to all /api routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/grounds', groundRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  const status = dbStatus === 'connected' ? 'ok' : 'degraded';
  res.status(status === 'ok' ? 200 : 503).json({
    status,
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    db: dbStatus,
  });
});

// Initialize Socket.IO
initializeSocket(server);

// Centralized error handling middleware (must be after routes)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    StructuredLogger.info(`Server is running on port ${PORT}`);
  });
}

export { app, server };
