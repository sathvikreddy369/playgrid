import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { PostType } from '@prisma/client';
import { postService } from './post.service';
import prisma from '../utils/db';
import { aiService } from './ai.service';
import { FraudDetection } from '../utils/fraudDetection';

describe('PostService', () => {
  let testUserId: string;
  let testCommunityId: string;

  beforeAll(async () => {
    // Create a test user to satisfy foreign key constraints
    const user = await prisma.user.create({
      data: {
        firebaseUid: `test-${Date.now()}`,
        email: `testuser-${Date.now()}@example.com`,
        name: 'Test User'
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.post.deleteMany({ where: { authorId: testUserId } });
      await prisma.profile.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
    }
    vi.restoreAllMocks();
  });

  describe('createPost', () => {
    it('should throw an error if content contains profanity', async () => {
      await expect(
        postService.createPost(testUserId, { content: 'This is a spam message with cheap views' })
      ).rejects.toThrow('Content flagged as spam or contains profanity.');
    });

    it('should successfully create a post', async () => {
      const result = await postService.createPost(testUserId, { content: 'Hello this is a valid post' });

      expect(result).toHaveProperty('id');
      expect(result.content).toBe('Hello this is a valid post');
      expect(result.authorId).toBe(testUserId);
    });
  });

  describe('getPosts', () => {
    it('should fetch posts', async () => {
      // Create some posts
      await postService.createPost(testUserId, { content: 'Post A' });
      await postService.createPost(testUserId, { content: 'Post B' });

      const result = await postService.getPosts({ authorId: testUserId }, undefined, 2);

      expect(result.posts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
