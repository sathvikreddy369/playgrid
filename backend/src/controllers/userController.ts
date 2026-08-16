import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let profile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: req.user.id,
          name: req.user.email?.split('@')[0] || 'Player',
          avatarId: 'avatar_01',
          reliabilityScore: 100
        }
      });
    }

    res.json({ user: req.user, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.params.id as string;
    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: { id: true, email: true, role: true, createdAt: true }
        }
      }
    });

    if (!profile) return res.status(404).json({ error: 'User profile not found' });

    // Check message request status
    let messageRequestStatus: string | null = null;
    if (req.user && req.user.id !== targetUserId) {
      const msgReq = await prisma.messageRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: req.user.id,
            receiverId: targetUserId
          }
        }
      });
      if (msgReq) messageRequestStatus = msgReq.status;
    }

    res.json({
      profile: {
        id: profile.id,
        userId: profile.userId,
        name: profile.name || 'Player',
        bio: profile.bio || '',
        avatarId: profile.avatarId || 'avatar_01',
        physicalSports: profile.physicalSports || [],
        eSports: profile.eSports || [],
        reliabilityScore: profile.reliabilityScore ?? 100,
        attendedGames: profile.attendedGames ?? 0,
        missedGames: profile.missedGames ?? 0,
        hostedGames: profile.hostedGames ?? 0,
        allowMessageRequests: profile.allowMessageRequests ?? true
      },
      messageRequestStatus
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserGameHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const filter = (req.query.filter as string) || 'ALL'; // ALL, ATTENDED, MISSED, HOSTED

    const skip = (page - 1) * limit;

    let attendances: any[] = [];
    let hostedMatches: any[] = [];

    if (filter === 'HOSTED') {
      hostedMatches = await prisma.match.findMany({
        where: { hostId: req.user.id },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      });
    } else {
      let statusWhere: any = {};
      if (filter === 'ATTENDED') statusWhere = { status: 'ATTENDED' };
      if (filter === 'MISSED') statusWhere = { status: 'MISSED' };

      attendances = await prisma.attendance.findMany({
        where: {
          userId: req.user.id,
          ...statusWhere
        },
        include: {
          match: {
            include: { host: { include: { profile: true } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });
    }

    res.json({ attendances, hostedMatches, page, limit });
  } catch (error) {
    console.error('Error fetching user game history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { 
      name, gender, age, bio, avatarId, latitude, longitude, 
      physicalSports, eSports, favoriteSports, levels, gameIds, achievements,
      allowMessageRequests, venueImages, amenities, pricing,
      riotId, steamId, discordId
    } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {
        name, gender, age, bio, avatarId, latitude, longitude,
        physicalSports, eSports, favoriteSports, levels, gameIds, achievements,
        allowMessageRequests: allowMessageRequests !== undefined ? Boolean(allowMessageRequests) : undefined,
        venueImages, amenities, pricing,
        riotId, steamId, discordId
      },
      create: {
        userId: req.user.id,
        name, gender, age, bio, avatarId: avatarId || 'avatar_01', latitude, longitude,
        physicalSports: physicalSports || [],
        eSports: eSports || [],
        favoriteSports: favoriteSports || [],
        levels: levels || [],
        gameIds: gameIds || [],
        achievements: achievements || [],
        allowMessageRequests: allowMessageRequests !== undefined ? Boolean(allowMessageRequests) : true,
        venueImages: venueImages || [],
        amenities: amenities || [],
        pricing,
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
    if (role !== 'USER' && role !== 'GROUND_OWNER' && role !== 'POOL_OWNER') {
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

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

