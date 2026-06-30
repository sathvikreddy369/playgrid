import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { matchService } from './match.service';
import prisma from '../utils/db';
import { aiService } from './ai.service';
import { notificationService } from './notification.service';

describe('MatchService', () => {
  let testUserId: string;
  let testUserId2: string;
  let createdMatchId: string;

  beforeAll(async () => {
    const user1 = await prisma.user.create({
      data: {
        firebaseUid: `test1-${Date.now()}`,
        email: `matchuser1-${Date.now()}@example.com`,
        name: 'Match User 1'
      }
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        firebaseUid: `test2-${Date.now()}`,
        email: `matchuser2-${Date.now()}@example.com`,
        name: 'Match User 2'
      }
    });
    testUserId2 = user2.id;

    vi.spyOn(notificationService, 'createNotification').mockResolvedValue(null as any);
  });

  afterAll(async () => {
    const userIds = [testUserId, testUserId2].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.matchPlayer.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.match.deleteMany({ where: { creatorId: { in: userIds } } });
      await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    vi.restoreAllMocks();
  });

  describe('createMatch', () => {
    it('should successfully create a match', async () => {
      const matchData = {
        title: 'Football Match',
        sport: 'Football',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Park',
        maxPlayers: 10,
        costPerPerson: 0
      };

      const result = await matchService.createMatch(testUserId, matchData);
      createdMatchId = result.id;

      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Football Match');
      expect(result.creatorId).toBe(testUserId);
    });
  });

  describe('handleJoinRequest', () => {
    it('should approve a player if match has space', async () => {
      // First create a join request
      await prisma.matchPlayer.create({
        data: {
          matchId: createdMatchId,
          userId: testUserId2,
          status: 'PENDING'
        }
      });

      const result = await matchService.handleJoinRequest(createdMatchId, testUserId, testUserId2, 'APPROVED');

      expect(result.status).toBe('APPROVED');
    });
  });
});
