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
      title, description, isOnline, locationText, mapLink, 
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

    const match = await prisma.match.create({
      data: {
        hostId: req.user.id,
        title,
        description,
        isOnline,
        locationText,
        mapLink,
        latitude,
        longitude,
        date: parsedDate,
        isWeekend: weekendFlag,
        totalSlots,
        filledSlots: 0,
        status: 'AVAILABLE',
        tags: finalTags,
        pricePerHead: pricePerHead || 0
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
    const { status, tag, search, latitude, longitude, radius, page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build the query where clause
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // By default only show available and filled matches
      where.status = { in: ['AVAILABLE', 'FILLED'] };
    }

    if (tag) {
      where.tags = { has: (tag as string).toLowerCase() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { locationText: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    let matches;

    // Post-process for distance if lat/lng/radius are provided
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string); // in km
      
      // Using raw SQL for Haversine formula to find matches within radius
      // Prisma doesn't support advanced spatial queries out-of-the-box without PostGIS
      const rawMatches = await prisma.$queryRaw<any[]>`
        SELECT m.*, 
        (6371 * acos(cos(radians(${lat})) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(m.latitude)))) AS distance
        FROM "Match" m
        WHERE m.latitude IS NOT NULL 
          AND m.longitude IS NOT NULL
          AND m.status IN ('AVAILABLE', 'FILLED')
        HAVING (6371 * acos(cos(radians(${lat})) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(m.latitude)))) <= ${rad}
        ORDER BY distance ASC
        LIMIT ${limitNum} OFFSET ${skip}
      `;

      // We need to fetch the relations since queryRaw doesn't include nested objects automatically
      const matchIds = rawMatches.map(m => m.id);

      // If no matches found in radius, return empty early
      if (matchIds.length === 0) {
        return res.json({ matches: [], hasMore: false });
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
        orderBy: { date: 'asc' }
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
        orderBy: { date: 'asc' }
      });
    }

    const hasMore = matches.length === limitNum;

    res.json({ matches, hasMore });
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

