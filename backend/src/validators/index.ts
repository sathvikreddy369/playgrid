import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────
export const syncBodySchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
}).strict();

export const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  sports: z.array(z.string().max(50)).max(20).optional(),
  favoriteGames: z.array(z.string().max(50)).max(20).optional(),
  age: z.number().int().min(13).max(120).optional().nullable(),
  homeLatitude: z.number().min(-90).max(90).optional().nullable(),
  homeLongitude: z.number().min(-180).max(180).optional().nullable(),
  preferredPlayTimes: z.array(z.string().max(50)).max(10).optional(),
  skillLevels: z.record(z.string(), z.string()).optional().nullable(),
}).strict();

// ─── Posts ─────────────────────────────────────────────────────────────
export const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['LOOKING_FOR_PLAYERS', 'LOOKING_FOR_TEAM', 'COMMUNITY_POST', 'TOURNAMENT_ANNOUNCEMENT', 'GROUND_PROMOTION', 'GENERAL', 'QUESTION', 'EQUIPMENT', 'TRAINING']).optional(),
  location: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  communityId: z.string().uuid().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
}).strict();

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000),
}).strict();

export const createReplySchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
}).strict();

// ─── Matches ──────────────────────────────────────────────────────────
export const createMatchSchema = z.object({
  title: z.string().min(1).max(200),
  sport: z.string().min(1).max(100),
  date: z.string().datetime({ offset: true }).or(z.string().min(1)),
  location: z.string().min(1).max(300),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  maxPlayers: z.union([z.number().int().min(2).max(500), z.string().regex(/^\d+$/)]),
  costPerPerson: z.union([z.number().min(0), z.string().regex(/^\d+\.?\d*$/), z.null()]).optional(),
  skillLevel: z.enum(['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']).optional(),
  communityId: z.string().uuid().optional().nullable(),
}).strict();

export const matchCommentSchema = z.object({
  content: z.string().min(1).max(1000),
}).strict();

export const markAttendanceSchema = z.object({
  rating: z.number().int().min(1).max(5),
}).strict();

// ─── Communities ──────────────────────────────────────────────────────
export const createCommunitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  location: z.string().max(200).optional(),
}).strict();

export const verifyCommunitySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
}).strict();

// ─── Grounds ──────────────────────────────────────────────────────────
export const createGroundSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(300),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  pricing: z.string().max(200).optional(),
  amenities: z.array(z.string().max(100)).max(30).optional(),
  sports: z.array(z.string().max(50)).max(20).optional(),
  photos: z.array(z.string().url()).max(20).optional(),
  contactPhone: z.string().max(20).optional(),
}).strict();

export const updateGroundSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  location: z.string().min(1).max(300).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  pricing: z.string().max(200).optional().nullable(),
  amenities: z.array(z.string().max(100)).max(30).optional(),
  sports: z.array(z.string().max(50)).max(20).optional(),
  photos: z.array(z.string().url()).max(20).optional(),
  contactPhone: z.string().max(20).optional().nullable(),
}).strict();

export const groundReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
}).strict();

export const verifyGroundSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
}).strict();

// ─── Reports ──────────────────────────────────────────────────────────
export const createReportSchema = z.object({
  targetType: z.enum(['POST', 'USER', 'COMMUNITY', 'GROUND', 'MESSAGE']),
  targetId: z.string().uuid(),
  reason: z.string().min(1).max(1000),
}).strict();

export const resolveReportSchema = z.object({
  action: z.enum(['ACTION_TAKEN', 'DISMISSED']),
}).strict();

// ─── Search ───────────────────────────────────────────────────────────
export const aiSearchSchema = z.object({
  q: z.string().min(1).max(500),
}).strict();

// ─── Admin ────────────────────────────────────────────────────────────
export const upgradeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['PLAYER', 'ORGANIZER']),
}).strict();
