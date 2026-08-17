import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db';
import { calculateHaversineDistance, isValidCoordinates } from '../utils/location';

// POST /api/venues/application
export const submitVenueApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      description,
      category,
      sports,
      address,
      locality,
      latitude,
      longitude,
      pricePerHour,
      ownerPhone,
      images,
      amenities
    } = req.body;

    if (!name || !locality || latitude === undefined || longitude === undefined || !pricePerHour) {
      res.status(400).json({ error: 'Name, locality, coordinates, and price per hour are required.' });
      return;
    }

    if (!isValidCoordinates(latitude, longitude)) {
      res.status(400).json({ error: 'Invalid latitude or longitude coordinates.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'GROUND_OWNER' }
    });

    const venue = await prisma.venue.create({
      data: {
        ownerId: userId,
        name,
        description: description || '',
        category: category || 'Sports Venue',
        sports: Array.isArray(sports) ? sports : ['Cricket', 'Football'],
        address: address || locality,
        locality,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        pricePerHour: parseFloat(pricePerHour),
        ownerPhone: ownerPhone || '',
        images: Array.isArray(images) ? images.slice(0, 5) : [],
        amenities: Array.isArray(amenities) ? amenities : ['Floodlights', 'Parking'],
        status: 'PENDING_APPROVAL'
      }
    });

    res.status(201).json({
      message: 'Venue application submitted successfully and is pending admin approval.',
      venue
    });
  } catch (error) {
    console.error('Error submitting venue application:', error);
    res.status(500).json({ error: 'Failed to submit venue application' });
  }
};

// GET /api/venues/my-venue
export const getMyVenue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const venue = await prisma.venue.findFirst({
      where: { ownerId: userId },
      include: {
        matches: {
          include: {
            attendances: { where: { status: 'ATTENDED' } }
          },
          orderBy: { date: 'desc' }
        },
        venueReviews: {
          include: {
            author: { select: { email: true, profile: { select: { name: true, avatarId: true } } } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!venue) {
      res.json({ venue: null });
      return;
    }

    const totalMatchesHosted = venue.matches.length;
    const upcomingMatches = venue.matches.filter(m => new Date(m.date) >= new Date() && m.status !== 'CANCELLED').length;
    const completedMatches = venue.matches.filter(m => m.status === 'COMPLETED').length;

    let totalParticipants = 0;
    let estimatedMatchValue = 0;

    venue.matches.forEach(m => {
      const confirmed = m.filledSlots || 0;
      totalParticipants += confirmed;
      estimatedMatchValue += (m.pricePerHead || 0) * confirmed;
    });

    res.json({
      venue,
      analytics: {
        totalMatchesHosted,
        upcomingMatches,
        completedMatches,
        totalParticipants,
        estimatedMatchValue,
        averageRating: venue.rating,
        reviewCount: venue.reviewCount
      }
    });
  } catch (error) {
    console.error('Error fetching owner venue:', error);
    res.status(500).json({ error: 'Failed to fetch venue details' });
  }
};

// GET /api/venues
export const getApprovedVenues = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, locality, latitude, longitude, radius = '25' } = req.query;

    const whereClause: any = {
      status: 'APPROVED'
    };

    if (category && category !== 'All') {
      whereClause.category = category as string;
    }

    if (locality) {
      whereClause.locality = { contains: locality as string, mode: 'insensitive' };
    }

    const venues = await prisma.venue.findMany({
      where: whereClause,
      include: {
        owner: { select: { email: true, profile: { select: { name: true } } } },
        _count: { select: { matches: true, venueReviews: true } }
      },
      orderBy: { rating: 'desc' }
    });

    const userLat = latitude ? parseFloat(latitude as string) : null;
    const userLng = longitude ? parseFloat(longitude as string) : null;
    const maxRadius = parseFloat(radius as string);

    let result = venues.map(v => {
      let distanceKm: number | null = null;
      if (isValidCoordinates(userLat, userLng) && isValidCoordinates(v.latitude, v.longitude)) {
        distanceKm = calculateHaversineDistance(userLat!, userLng!, v.latitude, v.longitude);
      }
      return {
        ...v,
        distanceKm
      };
    });

    if (isValidCoordinates(userLat, userLng) && maxRadius) {
      result = result.filter(v => v.distanceKm === null || v.distanceKm <= maxRadius);
      result.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    res.json({ venues: result });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
};

// GET /api/venues/:id
export const getVenueById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true, profile: { select: { name: true } } } },
        matches: {
          where: { date: { gte: new Date() }, status: 'AVAILABLE' },
          orderBy: { date: 'asc' },
          take: 6
        },
        venueReviews: {
          include: {
            author: { select: { id: true, email: true, profile: { select: { name: true, avatarId: true } } } }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!venue || (venue.status !== 'APPROVED' && req.user?.role !== 'ADMIN' && req.user?.id !== venue.ownerId)) {
      res.status(404).json({ error: 'Venue not found or pending approval' });
      return;
    }

    res.json({ venue });
  } catch (error) {
    console.error('Error fetching venue by ID:', error);
    res.status(500).json({ error: 'Failed to fetch venue details' });
  }
};

// POST /api/venues/:id/reviews
export const submitVenueReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string; // venueId
    const userId = req.user!.id;
    const { rating, comment, matchId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      return;
    }

    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) {
      res.status(404).json({ error: 'Venue not found' });
      return;
    }

    if (matchId) {
      const attendance = await prisma.attendance.findFirst({
        where: { matchId: matchId as string, userId, status: 'ATTENDED' }
      });
      if (!attendance) {
        res.status(403).json({ error: 'You can only review venues for matches you have attended.' });
        return;
      }
    }

    const matchIdVal = (matchId as string) || null;

    const existing = await prisma.venueReview.findFirst({
      where: {
        venueId: id,
        authorId: userId,
        matchId: matchIdVal
      }
    });

    if (existing) {
      res.status(400).json({ error: 'You have already reviewed this venue for this match.' });
      return;
    }

    const review = await prisma.venueReview.create({
      data: {
        venueId: id,
        authorId: userId,
        matchId: matchIdVal,
        rating: parseInt(rating),
        comment: comment || ''
      }
    });

    const allReviews = await prisma.venueReview.findMany({ where: { venueId: id } });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.venue.update({
      where: { id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length
      }
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error submitting venue review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};
