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

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Initialize Socket.io
initializeSocket(httpServer);

// Start Cron Jobs (e.g. locking past matches)
startCronJobs();

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
