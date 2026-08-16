import { z } from 'zod';

export const upsertProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional().nullable(),
    gender: z.string().optional().nullable(),
    age: z.number().int().min(10).max(100).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    favoriteSports: z.array(z.string()).optional(),
    levels: z.array(z.string()).optional(),
    gameIds: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    venueImages: z.array(z.string().url()).optional(),
    amenities: z.array(z.string()).optional(),
    pricing: z.number().nonnegative().optional().nullable(),
    riotId: z.string().optional().nullable(),
    steamId: z.string().optional().nullable(),
    discordId: z.string().optional().nullable()
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(['USER', 'GROUND_OWNER', 'POOL_OWNER'])
  })
});
