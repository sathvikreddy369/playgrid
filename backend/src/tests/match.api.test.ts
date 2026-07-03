import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
  })),
}));

import request from 'supertest';
import { app } from '../index';
import prisma from '../utils/db';
import { auth } from '../utils/firebase';

describe('Match API', () => {
  let testUserId: string;
  let firebaseUid: string;
  const mockToken = 'mock-valid-token';

  beforeAll(async () => {
    firebaseUid = `api-test-match-${Date.now()}`;
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email: `match-${Date.now()}@example.com`,
        name: 'Match Test User',
      }
    });
    testUserId = user.id;

    vi.spyOn(auth as any, 'verifyIdToken').mockResolvedValue({ uid: firebaseUid } as any);
  });

  afterAll(async () => {
    await prisma.match.deleteMany({ where: { creatorId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    vi.restoreAllMocks();
  });

  describe('POST /api/matches', () => {
    it('should reject unauthenticated creation', async () => {
      const res = await request(app)
        .post('/api/matches')
        .send({ title: 'Test Match', sport: 'Football', date: new Date().toISOString(), location: 'Stadium', maxPlayers: 10 });
      expect(res.status).toBe(401);
    });

    it('should create a match when authenticated', async () => {
      const matchData = {
        title: 'Champions Final',
        sport: 'Football',
        date: new Date().toISOString(),
        location: 'Wembley',
        maxPlayers: 22,
        costPerPerson: 10
      };

      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(matchData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Champions Final');
      expect(res.body.creatorId).toBe(testUserId);
    });
  });
});
