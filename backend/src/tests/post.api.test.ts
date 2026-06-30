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
import { aiService } from '../services/ai.service';
import { PostType } from '@prisma/client';

describe('Post API', () => {
  let testUserId: string;
  let firebaseUid: string;
  const mockToken = 'mock-valid-token';

  beforeAll(async () => {
    firebaseUid = `api-test-${Date.now()}`;
    // 1. Create a test user in DB
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email: `api-test-${Date.now()}@example.com`,
        name: 'API Test User',
      }
    });
    testUserId = user.id;

    // 2. Mock Firebase Auth middleware
    vi.spyOn(auth, 'verifyIdToken').mockResolvedValue({ uid: firebaseUid } as any);
  });

  afterAll(async () => {
    await prisma.post.deleteMany({ where: { authorId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    vi.restoreAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should get posts successfully (optional auth)', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(Array.isArray(res.body.posts)).toBe(true);
    });
  });

  describe('POST /api/posts', () => {
    it('should block unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ content: 'Hello World' });
      expect(res.status).toBe(401);
    });

    it('should successfully create a post when authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ content: 'Hello from Supertest' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('Hello from Supertest');
      expect(res.body.authorId).toBe(testUserId);
    });
  });
});
