import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Global state for mock database
let mockMatch: any = null;
let mockRequests: any[] = [];
let mockNotifications: any[] = [];

vi.mock('../db', () => ({
  prisma: {
    match: {
      findUnique: vi.fn(async ({ where }) => {
        if (mockMatch && mockMatch.id === where.id) return mockMatch;
        return null;
      }),
      update: vi.fn(async ({ where, data }) => {
        if (mockMatch && mockMatch.id === where.id) {
          if (data.filledSlots?.increment) {
            mockMatch.filledSlots += data.filledSlots.increment;
          }
          if (data.status) {
            mockMatch.status = data.status;
          }
          return mockMatch;
        }
        return null;
      })
    },
    request: {
      findUnique: vi.fn(async ({ where }) => {
        if (where.id) {
          return mockRequests.find(r => r.id === where.id) || null;
        }
        if (where.matchId_userId) {
          return mockRequests.find(r => r.matchId === where.matchId_userId.matchId && r.userId === where.matchId_userId.userId) || null;
        }
        return null;
      }),
      findMany: vi.fn(async () => mockRequests),
      create: vi.fn(async ({ data }) => {
        const newReq = { id: `req-${Date.now()}-${Math.random()}`, ...data };
        mockRequests.push(newReq);
        return newReq;
      }),
      update: vi.fn(async ({ where, data }) => {
        const req = mockRequests.find(r => r.id === where.id);
        if (req) {
          req.status = data.status;
          return req;
        }
        return null;
      })
    },
    notification: {
      create: vi.fn(async ({ data }) => {
        mockNotifications.push(data);
        return { id: `notif-${Date.now()}`, ...data };
      })
    },
    $transaction: vi.fn(async (cb) => {
      // Simulate interactive transaction with atomic isolation
      return await cb({
        match: {
          findUnique: async ({ where }: any) => {
            if (mockMatch && mockMatch.id === where.id) return { ...mockMatch };
            return null;
          },
          update: async ({ where, data }: any) => {
            if (mockMatch && mockMatch.id === where.id) {
              if (data.filledSlots?.increment) {
                mockMatch.filledSlots += data.filledSlots.increment;
              }
              if (data.status) {
                mockMatch.status = data.status;
              }
              return { ...mockMatch };
            }
            return null;
          }
        },
        request: {
          update: async ({ where, data }: any) => {
            const req = mockRequests.find(r => r.id === where.id);
            if (req) {
              req.status = data.status;
              return { ...req };
            }
            return null;
          }
        },
        notification: {
          create: async ({ data }: any) => {
            mockNotifications.push(data);
            return { id: `notif-${Date.now()}`, ...data };
          }
        }
      });
    })
  }
}));

// Mock Auth Middleware to set simulated user identity
let currentUser: any = { id: 'host-user-1', email: 'host@playgrid.com' };

vi.mock('../middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized: missing authorization header' });
    req.user = currentUser;
    next();
  }
}));

import requestRoutes from '../routes/requestRoutes';
import matchRoutes from '../routes/matchRoutes';

const app = express();
app.use(express.json());
app.use('/api/requests', requestRoutes);
app.use('/api/matches', matchRoutes);

describe('Adversarial Concurrency & Edge-Case Security Tests', () => {
  beforeEach(() => {
    mockMatch = {
      id: 'match-101',
      hostId: 'host-user-1',
      title: 'Competitive 5v5 Futsal',
      date: new Date(Date.now() + 86400000).toISOString(),
      totalSlots: 1,
      filledSlots: 0,
      status: 'AVAILABLE'
    };
    mockRequests = [
      { id: 'req-1', matchId: 'match-101', userId: 'player-1', status: 'PENDING', match: mockMatch },
      { id: 'req-2', matchId: 'match-101', userId: 'player-2', status: 'PENDING', match: mockMatch }
    ];
    mockNotifications = [];
    currentUser = { id: 'host-user-1', email: 'host@playgrid.com' };
  });

  it('Concurrently approves two pending requests for a 1-slot match: exactly 1 succeeds, 1 is rejected with MATCH_FULL', async () => {
    const p1 = request(app).post('/api/requests/action/req-1').send({ action: 'ACCEPTED' });
    const p2 = request(app).post('/api/requests/action/req-2').send({ action: 'ACCEPTED' });

    const results = await Promise.all([p1, p2]);
    const statuses = results.map(r => r.status);

    expect(statuses).toContain(200);
    expect(statuses).toContain(400);
    expect(mockMatch.filledSlots).toBe(1);
    expect(mockMatch.filledSlots).toBeLessThanOrEqual(mockMatch.totalSlots);
    expect(mockMatch.status).toBe('FILLED');
  });

  it('Prevents host from requesting to join their own hosted match', async () => {
    currentUser = { id: 'host-user-1', email: 'host@playgrid.com' };
    const res = await request(app).post('/api/requests/match-101');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/hosts cannot request to join/i);
  });

  it('Prevents non-host user from cancelling a match', async () => {
    currentUser = { id: 'imposter-user', email: 'imposter@playgrid.com' };
    const res = await request(app).post('/api/matches/match-101/cancel');
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/only host/i);

  });

  it('Prevents duplicate pending join requests from the same user', async () => {
    currentUser = { id: 'player-1', email: 'player1@playgrid.com' };
    const res = await request(app).post('/api/requests/match-101');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already have a pending/i);
  });
});
