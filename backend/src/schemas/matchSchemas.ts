import { z } from 'zod';

export const createMatchSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    isOnline: z.boolean(),
    locationText: z.string().optional(),
    mapLink: z.string().url().optional().or(z.literal('')),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    date: z.string().datetime().refine(val => new Date(val) > new Date(), {
      message: 'Match date must be in the future'
    }),

    totalSlots: z.number().int().positive(),
    tags: z.array(z.string()).optional(),
    pricePerHead: z.number().nonnegative().optional()
  })
});

export const getMatchesSchema = z.object({
  query: z.object({
    status: z.enum(['AVAILABLE', 'FILLED', 'COMPLETED', 'CANCELLED']).optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    latitude: z.string().optional(), // Query params come as strings
    longitude: z.string().optional(),
    radius: z.string().optional()
  })
});
