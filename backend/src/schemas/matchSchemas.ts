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
    status: z.enum(['AVAILABLE', 'FILLED', 'COMPLETED', 'CANCELLED']).optional(),
    type: z.enum(['PHYSICAL', 'E_GAME', 'ALL']).optional(),
    sport: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    radius: z.string().optional(),
    sort: z.enum(['soonest', 'nearest', 'price_low', 'price_high']).optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});
