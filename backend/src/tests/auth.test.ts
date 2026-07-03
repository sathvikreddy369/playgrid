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

describe('Auth API', () => {
  const mockToken = 'mock-valid-token';
  const firebaseUid = `api-test-auth-${Date.now()}`;

  beforeAll(async () => {
    vi.spyOn(auth as any, 'verifyIdToken').mockResolvedValue({ uid: firebaseUid } as any);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { firebaseUid } });
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/sync', () => {
    it('should fail without a token', async () => {
      const res = await request(app).post('/api/auth/sync');
      expect(res.status).toBe(401);
    });

    it('should sync user with valid token (creates user if new)', async () => {
      const res = await request(app)
        .post('/api/auth/sync')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ email: 'test@auth.com', name: 'Auth Test' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('test@auth.com');
      expect(res.body.firebaseUid).toBe(firebaseUid);
    });

    it('should return existing user on subsequent syncs', async () => {
      const res = await request(app)
        .post('/api/auth/sync')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ email: 'test@auth.com', name: 'Auth Test' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
    });
  });
});
