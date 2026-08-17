import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock DB state
let mockProfile: any = null;
let mockUser: any = { id: 'user-host-1', email: 'host@playgrid.com', role: 'USER' };
let mockGuestUser: any = { id: 'user-guest-2', email: 'guest@playgrid.com', role: 'USER' };
let mockMatches: any[] = [];
let mockAttendances: any[] = [];
let mockMessageRequests: any[] = [];

vi.mock('../db', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(async ({ where }) => {
        if (mockProfile && mockProfile.userId === where.userId) return mockProfile;
        return null;
      }),
      upsert: vi.fn(async ({ update, create }) => {
        mockProfile = { ...mockProfile, ...update, ...create };
        return mockProfile;
      }),
      update: vi.fn(async ({ where, data }) => {
        if (mockProfile && mockProfile.userId === where.userId) {
          mockProfile = { ...mockProfile, ...data };
          return mockProfile;
        }
        return null;
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        if (mockProfile && mockProfile.userId === where.userId) {
          mockProfile = { ...mockProfile, ...data };
        }
        return { count: 1 };
      })
    },
    match: {
      findUnique: vi.fn(async ({ where }) => {
        return mockMatches.find((m) => m.id === where.id) || null;
      }),
      findMany: vi.fn(async ({ where, skip = 0, take = 10 }) => {
        let res = [...mockMatches];
        const matchTypeFilter = where?.matchType || where?.AND?.find((c: any) => c.matchType)?.matchType;
        if (matchTypeFilter) res = res.filter((m) => m.matchType === matchTypeFilter);
        const statusIn = where?.status?.in || where?.AND?.find((c: any) => c.status?.in)?.status?.in;
        if (statusIn) res = res.filter((m) => statusIn.includes(m.status));
        return res.slice(skip, skip + take);
      }),
      create: vi.fn(async ({ data }) => {
        const newMatch = { id: `match-${Date.now()}`, ...data };
        mockMatches.push(newMatch);
        return newMatch;
      }),
      update: vi.fn(async ({ where, data }) => {
        const m = mockMatches.find((x) => x.id === where.id);
        if (m) {
          Object.assign(m, data);
          return m;
        }
        return null;
      }),
      count: vi.fn(async () => mockMatches.length)
    },
    attendance: {
      findMany: vi.fn(async ({ where }) => {
        return mockAttendances.filter((a) => {
          if (where.matchId && a.matchId !== where.matchId) return false;
          if (where.userId && a.userId !== where.userId) return false;
          return true;
        });
      }),
      upsert: vi.fn(async ({ where, update, create }) => {
        let idx = mockAttendances.findIndex(
          (a) => a.matchId === where.matchId_userId.matchId && a.userId === where.matchId_userId.userId
        );
        if (idx >= 0) {
          mockAttendances[idx] = { ...mockAttendances[idx], ...update };
          return mockAttendances[idx];
        } else {
          const newAtt = { id: `att-${Date.now()}`, ...create };
          mockAttendances.push(newAtt);
          return newAtt;
        }
      })
    },
    messageRequest: {
      findUnique: vi.fn(async ({ where }) => {
        if (where.senderId_receiverId) {
          return (
            mockMessageRequests.find(
              (r) =>
                r.senderId === where.senderId_receiverId.senderId &&
                r.receiverId === where.senderId_receiverId.receiverId
            ) || null
          );
        }
        if (where.id) return mockMessageRequests.find((r) => r.id === where.id) || null;
        return null;
      }),
      findMany: vi.fn(async ({ where }) => {
        return mockMessageRequests.filter((r) => r.receiverId === where.receiverId && r.status === where.status);
      }),
      create: vi.fn(async ({ data }) => {
        const newReq = { id: `msgreq-${Date.now()}`, ...data };
        mockMessageRequests.push(newReq);
        return newReq;
      }),
      update: vi.fn(async ({ where, data }) => {
        const req = mockMessageRequests.find((r) => r.id === where.id);
        if (req) {
          req.status = data.status;
          return req;
        }
        return null;
      })
    },
    notification: {
      create: vi.fn(async ({ data }) => ({ id: `notif-${Date.now()}`, ...data }))
    },
    $transaction: vi.fn(async (cb) => {
      const mockTx = {
        attendance: {
          upsert: vi.fn(async ({ where, update, create }) => {
            let idx = mockAttendances.findIndex(
              (a) => a.matchId === where.matchId_userId.matchId && a.userId === where.matchId_userId.userId
            );
            if (idx >= 0) {
              mockAttendances[idx] = { ...mockAttendances[idx], ...update };
              return mockAttendances[idx];
            } else {
              const newAtt = { id: `att-${Date.now()}`, ...create };
              mockAttendances.push(newAtt);
              return newAtt;
            }
          }),
          findMany: vi.fn(async () => mockAttendances)
        },
        match: {
          count: vi.fn(async () => 1),
          update: vi.fn(async () => mockMatches[0])
        },
        profile: {
          updateMany: vi.fn(async ({ where, data }) => {
            if (mockProfile && mockProfile.userId === where.userId) {
              mockProfile = { ...mockProfile, ...data };
            }
            return { count: 1 };
          })
        }
      };
      return cb(mockTx);
    })
  }
}));


// Mock Express app
const app = express();
app.use(express.json());

// Auth middleware mock
let currentTestUser = mockUser;
app.use((req: any, _res, next) => {
  req.user = currentTestUser;
  next();
});

// Import controllers
import { getProfile, upsertProfile, getPublicProfile } from '../controllers/userController';
import { markAttendance, getMatchAttendance } from '../controllers/attendanceController';
import { getMatches, createMatch } from '../controllers/matchController';
import { sendRequest, getIncomingRequests, handleRequestAction } from '../controllers/messageRequestController';

app.get('/api/users/profile', getProfile);
app.post('/api/users/profile', upsertProfile);
app.get('/api/users/public/:id', getPublicProfile);
app.get('/api/users/attendance/:matchId', getMatchAttendance);
app.post('/api/users/attendance/:matchId', markAttendance);
app.get('/api/matches', getMatches);
app.post('/api/matches', createMatch);
app.post('/api/users/message-requests', sendRequest);
app.get('/api/users/message-requests', getIncomingRequests);
app.post('/api/users/message-requests/:id/action', handleRequestAction);

describe('PlayGrid Community Expansion Suite', () => {
  beforeEach(() => {
    currentTestUser = mockUser;
    mockProfile = {
      userId: 'user-host-1',
      name: 'Host Player',
      bio: 'Weekend cricketer',
      avatarId: 'avatar_01',
      physicalSports: ['Cricket'],
      eSports: ['BGMI'],
      allowMessageRequests: true,
      attendedGames: 0,
      missedGames: 0,
      hostedGames: 0,
      reliabilityScore: 100
    };
    mockMatches = [];
    mockAttendances = [];
    mockMessageRequests = [];
  });

  // --- Profile Tests ---
  describe('Profile & Interests', () => {
    it('updates bio, avatarId, and preset interests', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .send({
          name: 'Updated Name',
          bio: 'Always down for football',
          avatarId: 'avatar_04',
          physicalSports: ['Football', 'Badminton'],
          eSports: ['BGMI', 'Valorant'],
          allowMessageRequests: true
        });

      expect(res.status).toBe(200);
      expect(res.body.profile.bio).toBe('Always down for football');
      expect(res.body.profile.avatarId).toBe('avatar_04');
      expect(res.body.profile.physicalSports).toContain('Football');
      expect(res.body.profile.eSports).toContain('Valorant');
    });

    it('returns public profile with statistics', async () => {
      const res = await request(app).get('/api/users/public/user-host-1');
      expect(res.status).toBe(200);
      expect(res.body.profile.name).toBe('Host Player');
      expect(res.body.profile.reliabilityScore).toBe(100);
    });
  });

  // --- Attendance & Reliability Tests ---
  describe('Attendance & Score Calculation', () => {
    it('allows match host to mark attendance and updates reliability score', async () => {
      // Setup match
      const m = { id: 'match-1', hostId: 'user-host-1', status: 'AVAILABLE', matchType: 'PHYSICAL' };
      mockMatches.push(m);

      const res = await request(app)
        .post('/api/users/attendance/match-1')
        .send({
          attendanceRecords: [
            { userId: 'user-host-1', status: 'ATTENDED' }
          ]
        });

      expect(res.status).toBe(200);
      expect(mockProfile.attendedGames).toBe(1);
    });

    it('rejects attendance submission from a non-host user with 403', async () => {
      const m = { id: 'match-1', hostId: 'user-host-1', status: 'AVAILABLE', matchType: 'PHYSICAL' };
      mockMatches.push(m);

      // Switch auth user to guest
      currentTestUser = mockGuestUser;

      const res = await request(app)
        .post('/api/users/attendance/match-1')
        .send({
          attendanceRecords: [{ userId: 'user-guest-2', status: 'ATTENDED' }]
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Only the match host can mark attendance/i);
    });
  });

  // --- Match Discovery & E-Sports Tests ---
  describe('Match Discovery & E-Sports Filtering', () => {
    it('creates E-Game match without physical venue requirement', async () => {
      const res = await request(app)
        .post('/api/matches')
        .send({
          title: 'BGMI Custom Squad Room',
          matchType: 'E_GAME',
          eGameName: 'BGMI',
          eGameMode: 'Squad',
          ePlatform: 'Mobile',
          roomCode: 'ID-9941',
          date: new Date().toISOString(),
          totalSlots: 16
        });

      expect(res.status).toBe(201);
      expect(res.body.match.matchType).toBe('E_GAME');
      expect(res.body.match.isOnline).toBe(true);
      expect(res.body.match.locationText).toMatch(/Online/i);
    });

    it('filters matches by type (PHYSICAL vs E_GAME)', async () => {
      mockMatches.length = 0;
      mockMatches.push({ id: 'm1', title: 'Cricket', matchType: 'PHYSICAL', status: 'AVAILABLE' });
      mockMatches.push({ id: 'm2', title: 'Valorant Tournament', matchType: 'E_GAME', status: 'AVAILABLE' });

      const resPhysical = await request(app).get('/api/matches?type=PHYSICAL');
      expect(resPhysical.status).toBe(200);
      expect(resPhysical.body.matches.length).toBe(1);
      expect(resPhysical.body.matches[0].matchType).toBe('PHYSICAL');

      const resEGame = await request(app).get('/api/matches?type=E_GAME');
      expect(resEGame.status).toBe(200);
      expect(resEGame.body.matches.length).toBe(1);
      expect(resEGame.body.matches[0].matchType).toBe('E_GAME');
    });
  });

  // --- Message Request & Privacy Tests ---
  describe('Message Requests & Privacy Toggle', () => {
    it('creates a message request between users', async () => {
      currentTestUser = mockUser;
      const res = await request(app)
        .post('/api/users/message-requests')
        .send({ receiverId: 'user-guest-2' });

      expect(res.status).toBe(201);
      expect(res.body.messageRequest.status).toBe('PENDING');
    });

    it('rejects message request when receiver disabled messaging toggle', async () => {
      // Mock receiver profile with allowMessageRequests: false
      mockProfile = { userId: 'user-guest-2', allowMessageRequests: false };

      currentTestUser = mockUser;
      const res = await request(app)
        .post('/api/users/message-requests')
        .send({ receiverId: 'user-guest-2' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not accepting new message requests/i);
    });

    it('rejects sending message request to oneself', async () => {
      currentTestUser = mockUser;
      const res = await request(app)
        .post('/api/users/message-requests')
        .send({ receiverId: 'user-host-1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot send a message request to yourself/i);
    });

    it('allows receiver to accept a pending message request', async () => {
      const msgReq = { id: 'req-99', senderId: 'user-host-1', receiverId: 'user-guest-2', status: 'PENDING' };
      mockMessageRequests.push(msgReq);

      currentTestUser = mockGuestUser;

      const res = await request(app)
        .post('/api/users/message-requests/req-99/action')
        .send({ action: 'ACCEPTED' });

      expect(res.status).toBe(200);
      expect(res.body.messageRequest.status).toBe('ACCEPTED');
    });

    it('allows receiver to decline a pending message request', async () => {
      const msgReq = { id: 'req-100', senderId: 'user-host-1', receiverId: 'user-guest-2', status: 'PENDING' };
      mockMessageRequests.push(msgReq);

      currentTestUser = mockGuestUser;

      const res = await request(app)
        .post('/api/users/message-requests/req-100/action')
        .send({ action: 'DECLINED' });

      expect(res.status).toBe(200);
      expect(res.body.messageRequest.status).toBe('DECLINED');
    });

    it('rejects duplicate pending message requests', async () => {
      mockMessageRequests.push({ id: 'req-101', senderId: 'user-host-1', receiverId: 'user-guest-2', status: 'PENDING' });

      currentTestUser = mockUser;
      const res = await request(app)
        .post('/api/users/message-requests')
        .send({ receiverId: 'user-guest-2' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already pending/i);
    });

    it('returns incoming pending message requests for current user', async () => {
      mockMessageRequests.push({ id: 'req-102', senderId: 'user-host-1', receiverId: 'user-guest-2', status: 'PENDING' });

      currentTestUser = mockGuestUser;
      const res = await request(app).get('/api/users/message-requests');

      expect(res.status).toBe(200);
      expect(res.body.requests.length).toBe(1);
    });
  });
});

