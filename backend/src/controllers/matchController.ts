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

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { status, tag, type, sport, search, latitude, longitude, radius, sort, page, limit } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit as string, 10) || 12);

    const whereConditions: any[] = [];

    // Filter by status
    if (status && status !== 'ALL') {
      whereConditions.push({ status: String(status) });
    } else {
      whereConditions.push({ status: { in: ['AVAILABLE', 'FILLED'] } });
    }

    // Filter by match type
    if (type === 'PHYSICAL') {
      whereConditions.push({ matchType: 'PHYSICAL' });
    } else if (type === 'E_GAME') {
      whereConditions.push({ matchType: 'E_GAME' });
    }

    // Filter by sport / tag
    const activeSport = (sport as string) || (tag as string);
    if (activeSport && activeSport !== 'ALL') {
      const s = activeSport.trim();
      const lower = s.toLowerCase();
      const upper = s.toUpperCase();
      const capitalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

      whereConditions.push({
        OR: [
          { tags: { hasSome: [s, lower, upper, capitalized] } },
          { eGameName: { contains: s, mode: 'insensitive' } },
          { title: { contains: s, mode: 'insensitive' } }
        ]
      });
    }

    // Search query across title, description, locationText, eGameName, and tags
    if (search && String(search).trim().length > 0) {
      const q = String(search).trim();
      whereConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { locationText: { contains: q, mode: 'insensitive' } },
          { eGameName: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q, q.toLowerCase(), q.toUpperCase()] } }
        ]
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Determine sorting
    let orderBy: any = { date: 'asc' };
    if (sort === 'price_low') orderBy = { pricePerHead: 'asc' };
    if (sort === 'price_high') orderBy = { pricePerHead: 'desc' };

    // Fetch matching records from DB
    let matches = await prisma.match.findMany({
      where,
      include: {
        host: {
          include: { profile: true }
        }
      },
      orderBy: sort === 'nearest' ? undefined : orderBy
    });

    // Haversine radius filtering & distance sorting if geolocation coordinates are provided
    const userLat = latitude ? parseFloat(String(latitude)) : null;
    const userLng = longitude ? parseFloat(String(longitude)) : null;
    const maxRadius = radius ? parseFloat(String(radius)) : null;

    if (userLat !== null && !isNaN(userLat) && userLng !== null && !isNaN(userLng)) {
      matches = matches.map((m: any) => {
        if (m.latitude !== null && m.latitude !== undefined && m.longitude !== null && m.longitude !== undefined) {
          const dist = haversineDistance(userLat, userLng, Number(m.latitude), Number(m.longitude));
          return { ...m, distance: Math.round(dist * 10) / 10 };
        }
        return m;
      });

      // Filter by max radius (in km)
      if (maxRadius !== null && !isNaN(maxRadius) && maxRadius > 0) {
        matches = matches.filter((m: any) => {
          if (m.matchType === 'E_GAME') return true;
          return m.distance !== undefined && m.distance <= maxRadius;
        });
      }

      // Sort by nearest
      if (sort === 'nearest') {
        matches.sort((a: any, b: any) => {
          const distA = a.distance !== undefined ? a.distance : 999999;
          const distB = b.distance !== undefined ? b.distance : 999999;
          return distA - distB;
        });
      }
    }

    // In-memory pagination after distance calculations & sorting
    const totalCount = matches.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedMatches = matches.slice(skip, skip + limitNum);
    const hasMore = skip + limitNum < totalCount;

    res.json({ matches: paginatedMatches, hasMore, page: pageNum, total: totalCount });
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

