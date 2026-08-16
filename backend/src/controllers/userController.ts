import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });

    res.json({ user: req.user, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { 
      name, gender, age, bio, latitude, longitude, 
      favoriteSports, levels, gameIds, achievements,
      venueImages, amenities, pricing,
      riotId, steamId, discordId
    } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {
        name, gender, age, bio, latitude, longitude,
        favoriteSports, levels, gameIds, achievements,
        venueImages, amenities, pricing,
        riotId, steamId, discordId
      },
      create: {
        userId: req.user.id,
        name, gender, age, bio, latitude, longitude,
        favoriteSports, levels, gameIds, achievements,
        venueImages, amenities, pricing,
        riotId, steamId, discordId
      }
    });

    res.json({ profile });
  } catch (error) {
    console.error('Error upserting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { role } = req.body;
    if (role !== 'USER' && role !== 'GROUND_OWNER') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { role }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
