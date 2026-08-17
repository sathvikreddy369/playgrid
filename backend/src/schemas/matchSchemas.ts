import { z } from 'zod';

export const createMatchSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().optional(),
    matchType: z.enum(['PHYSICAL', 'E_GAME']).optional(),
    eGameName: z.string().optional(),
    eGameMode: z.string().optional(),
    ePlatform: z.string().optional(),
    roomCode: z.string().optional(),
    isOnline: z.boolean().optional(),
    locationText: z.string().optional(),
    mapLink: z.string().optional().or(z.literal('')),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    date: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Match date must be a valid date'
    }),
    totalSlots: z.union([z.number().int().positive(), z.string().transform(v => parseInt(v, 10))]),
    tags: z.array(z.string()).optional(),
    pricePerHead: z.union([z.number().nonnegative(), z.string().transform(v => parseFloat(v))]).optional()
  })
});

export const getMatchesSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    type: z.string().optional(),
    sport: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    latitude: z.union([z.string(), z.number()]).optional(),
    longitude: z.union([z.string(), z.number()]).optional(),
    radius: z.union([z.string(), z.number()]).optional(),
    sort: z.string().optional(),
    page: z.union([z.string(), z.number()]).optional(),
    limit: z.union([z.string(), z.number()]).optional()
  }).passthrough()
});
