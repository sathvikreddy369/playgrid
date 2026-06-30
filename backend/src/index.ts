import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Initialize Socket.IO
initializeSocket(server);

// Centralized error handling middleware (must be after routes)
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
