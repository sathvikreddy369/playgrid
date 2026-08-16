import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock DB before importing controllers
vi.mock('../db', () => ({
  prisma: {
    match: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'test-match-id' })
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 'test-user-id' })
    }
  }
}));

import userRoutes from '../routes/userRoutes';
import matchRoutes from '../routes/matchRoutes';
import requestRoutes from '../routes/requestRoutes';
import reviewRoutes from '../routes/reviewRoutes';
import messageRoutes from '../routes/messageRoutes';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

describe('PlayGrid API Health & Auth Protection Tests', () => {
  it('GET /api/health returns 200 OK status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/matches returns public match list', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.matches)).toBe(true);
  });

  it('POST /api/matches without Auth token returns 401 Unauthorized', async () => {
    const res = await request(app).post('/api/matches').send({
      title: 'Unauthorized Match',
      isOnline: false,
      date: new Date(Date.now() + 86400000).toISOString(),
      totalSlots: 10
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authorization/i);
  });

  it('GET /api/users/profile without Auth token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });
});
