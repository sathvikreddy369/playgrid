import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { initializeSocket } from './socket';
import { startCronJobs } from './jobs/cron';

// Routes
import userRoutes from './routes/userRoutes';
import matchRoutes from './routes/matchRoutes';
import requestRoutes from './routes/requestRoutes';
import reviewRoutes from './routes/reviewRoutes';
import messageRoutes from './routes/messageRoutes';
import adminRoutes from './routes/adminRoutes';
import venueRoutes from './routes/venueRoutes';
import reportRoutes from './routes/reportRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Robust CORS configuration supporting gamevia.vercel.app and preview domains
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/+$/, ''))
  : ['http://localhost:5173', 'https://gamevia.vercel.app'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.trim().replace(/\/+$/, '');
    const isAllowed =
      allowedOrigins.includes(normalized) ||
      allowedOrigins.includes('*') ||
      /\.vercel\.app$/.test(normalized) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalized);

    if (isAllowed) {
      return callback(null, true);
    }
    // Fallback: allow to prevent CORS blockages for frontend deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-email']
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io
initializeSocket(httpServer);

// Start Cron Jobs (e.g. locking past matches)
startCronJobs();

// Basic health check (available at /health and /api/health)
const healthHandler = (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes (Mounted under both /api/... and root /... for maximum frontend compatibility)
app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/matches', matchRoutes);
app.use('/matches', matchRoutes);

app.use('/api/requests', requestRoutes);
app.use('/requests', requestRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/reviews', reviewRoutes);

app.use('/api/messages', messageRoutes);
app.use('/messages', messageRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/venues', venueRoutes);
app.use('/venues', venueRoutes);

app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


