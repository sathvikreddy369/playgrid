import { Request, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { isWeekend, parseISO } from 'date-fns';

export const createMatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch user profile to check if they are a swimming pool owner
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (profile?.venueType === 'SWIMMING_POOL') {
      return res.status(403).json({ error: 'Swimming pool owners cannot host matches' });
    }

    const {
      title, description, matchType, eGameName, eGameMode, ePlatform, roomCode,
      isOnline, locationText, mapLink, 
      latitude, longitude, date, totalSlots, tags, pricePerHead
    } = req.body;

    const parsedDate = parseISO(date);
    const weekendFlag = isWeekend(parsedDate);
    
    // Add Weekend/Weekday tag automatically if not present in tags array
    const finalTags = [...(tags || [])];
    const timeTag = weekendFlag ? 'weekend' : 'weekday';
    if (!finalTags.map(t => t.toLowerCase()).includes(timeTag)) {
      finalTags.push(timeTag);
    }
    if (matchType === 'E_GAME' && eGameName && !finalTags.includes(eGameName)) {
      finalTags.push(eGameName);
    }

    const match = await prisma.match.create({
      data: {
        hostId: req.user.id,
        title,
        description,
        matchType: matchType === 'E_GAME' ? 'E_GAME' : 'PHYSICAL',
        eGameName,
        eGameMode,
        ePlatform,
        roomCode,
        isOnline: matchType === 'E_GAME' ? true : Boolean(isOnline),
        locationText: matchType === 'E_GAME' ? 'Online / Custom Room' : (locationText || 'Hyderabad'),
        mapLink,
        latitude: matchType === 'E_GAME' ? null : latitude,
        longitude: matchType === 'E_GAME' ? null : longitude,
        date: parsedDate,
        isWeekend: weekendFlag,
        totalSlots: parseInt(totalSlots, 10) || 10,
        filledSlots: 0,
        status: 'AVAILABLE',
        tags: finalTags,
        pricePerHead: parseFloat(pricePerHead) || 0
      }
    });

    res.status(201).json({ match });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { status, tag, type, sport, search, latitude, longitude, radius, sort, page, limit } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, parseInt(limit as string) || 12);
    const skip = (pageNum - 1) * limitNum;

    // Build the query where clause
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['AVAILABLE', 'FILLED'] };
    }

    if (type === 'PHYSICAL') where.matchType = 'PHYSICAL';
    if (type === 'E_GAME') where.matchType = 'E_GAME';

    if (sport && sport !== 'ALL') {
      where.tags = { hasSome: [(sport as string), (sport as string).toLowerCase()] };
    } else if (tag && tag !== 'ALL') {
      where.tags = { hasSome: [(tag as string), (tag as string).toLowerCase()] };
    }

    if (search && (search as string).trim().length > 0) {
      const q = (search as string).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { locationText: { contains: q, mode: 'insensitive' } },
        { eGameName: { contains: q, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = { date: 'asc' };
    if (sort === 'price_low') orderBy = { pricePerHead: 'asc' };
    if (sort === 'price_high') orderBy = { pricePerHead: 'desc' };

    let matches: any[] = [];

    // Haversine bounding-box distance query for physical matches when lat/lng/radius provided
    if (latitude && longitude && radius && type !== 'E_GAME') {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string); // in km
      
      const rawMatches = await prisma.$queryRaw<any[]>`
        SELECT m.*, 
        (6371 * acos(cos(radians(${lat})) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(m.latitude)))) AS distance
        FROM "Match" m
        WHERE m.latitude IS NOT NULL 
          AND m.longitude IS NOT NULL
          AND m.status IN ('AVAILABLE', 'FILLED')
          AND m."matchType" = 'PHYSICAL'
        HAVING (6371 * acos(cos(radians(${lat})) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(m.latitude)))) <= ${rad}
        ORDER BY distance ASC
        LIMIT ${limitNum} OFFSET ${skip}
      `;

      const matchIds = rawMatches.map(m => m.id);

      if (matchIds.length === 0) {
        return res.json({ matches: [], hasMore: false, page: pageNum });
      }
      
      matches = await prisma.match.findMany({
        where: {
          ...where,
          id: { in: matchIds }
        },
        include: {
          host: {
            include: { profile: true }
          }
        },
        orderBy
      });
    } else {
      matches = await prisma.match.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          host: {
            include: { profile: true }
          }
        },
        orderBy
      });
    }

    const hasMore = matches.length === limitNum;

    res.json({ matches, hasMore, page: pageNum });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getMatchById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        host: {
          include: { profile: true }
        },
        requests: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        }
      }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });

    res.json({ match });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyMatches = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { hostId: req.user.id },
          {
            requests: {
              some: {
                userId: req.user.id,
                status: 'ACCEPTED'
              }
            }
          }
        ]
      },
      include: {
        host: {
          include: { profile: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({ matches });
  } catch (error) {
    console.error('Error fetching my matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelMatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;

    const match = await prisma.match.findUnique({
      where: { id },
      include: { requests: true }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only host can cancel this match' });
    }

    if (match.status === 'CANCELLED' || match.status === 'COMPLETED') {
      return res.status(400).json({ error: `Cannot cancel a match with status ${match.status}` });
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Notify all accepted participants
    const acceptedRequests = match.requests.filter(r => r.status === 'ACCEPTED');
    for (const request of acceptedRequests) {
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: 'Match Cancelled',
          body: `The match "${match.title}" has been cancelled by the host.`,
          link: `/match/${match.id}`
        }
      });
    }

    res.json({ match: updatedMatch });
  } catch (error) {
    console.error('Error cancelling match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

