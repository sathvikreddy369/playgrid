import prisma from '../utils/db';
import { VenueStatus } from '@prisma/client';
import { aiService } from './ai.service';
import { activityService } from './activity.service';
import { StructuredLogger } from '../utils/logger';

export class VenueService {
  async createVenue(userId: string, data: any) {
    return prisma.venue.create({
      data: {
        name: data.name,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        pricing: data.pricing,
        amenities: data.amenities || [],
        sports: data.sports || [],
        photos: data.photos || [],
        description: data.description,
        operatingHours: data.operatingHours,
        contactEmail: data.contactEmail,
        website: data.website,
        contactPhone: data.contactPhone,
        status: VenueStatus.PENDING,
        ownerId: userId,
      },
    });
  }

  async getVenues(filters?: { status?: VenueStatus; sport?: string; location?: string; minRating?: number; lat?: number; lng?: number; radius?: number; sortBy?: string }) {
    const where: any = { status: filters?.status || VenueStatus.VERIFIED };
    
    if (filters?.sport) {
      where.sports = { has: filters.sport };
    }
    if (filters?.location) {
      where.OR = [
        { location: { contains: filters.location, mode: 'insensitive' } },
        { city: { contains: filters.location, mode: 'insensitive' } }
      ];
    }

    const venues = await prisma.venue.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = venues.map(g => {
      const totalRating = g.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0);
      const avgRating = g.reviews.length > 0 ? parseFloat((totalRating / g.reviews.length).toFixed(1)) : 0;
      
      const { reviews, ...venueWithoutReviews } = g;
      return { ...venueWithoutReviews, avgRating };
    });

    let result: any[] = formatted;

    if (filters?.minRating) {
      result = result.filter(g => g.avgRating >= filters.minRating!);
    }

    if (filters?.lat && filters?.lng) {
      const radius = filters.radius || 50; // Default 50km
      result = result.map((v: any) => {
        if (!v.latitude || !v.longitude) return { ...v, distance: Infinity };
        // Haversine formula
        const R = 6371; // km
        const dLat = (v.latitude - filters.lat!) * Math.PI / 180;
        const dLon = (v.longitude - filters.lng!) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(filters.lat! * Math.PI / 180) * Math.cos(v.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return { ...v, distance: R * c };
      }).filter((v: any) => v.distance <= radius);
      
      if (filters?.sortBy === 'nearby') {
        result.sort((a: any, b: any) => a.distance - b.distance);
      }
    }

    if (filters?.sortBy === 'rating') {
      result.sort((a: any, b: any) => b.avgRating - a.avgRating);
    }

    return result;
  }

  async getVenueById(id: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { reviews: true, matches: true } },
        matches: {
          where: { status: 'OPEN', date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 5,
          include: {
            _count: { select: { players: { where: { status: 'APPROVED' } } } }
          }
        }
      }
    });

    if (!venue) return null;

    // Calculate average rating
    const totalRating = venue.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0);
    const avgRating = venue.reviews.length > 0 ? (totalRating / venue.reviews.length).toFixed(1) : 0;

    return { ...venue, avgRating };
  }

  async updateVenue(id: string, userId: string, data: any) {
    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new Error('Venue not found');
    if (venue.ownerId !== userId) throw new Error('Unauthorized');

    return prisma.venue.update({
      where: { id },
      data,
    });
  }

  async addReview(venueId: string, userId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    
    // Check if user attended a match at this venue
    const attendedMatch = await prisma.matchPlayer.findFirst({
      where: {
        userId,
        status: 'ATTENDED',
        match: { venueId }
      }
    });

    if (!attendedMatch) {
      throw new Error('You can only review venues where you have attended a match.');
    }
    
    // Upsert to handle the unique constraint (one review per user per venue)
    const review = await prisma.venueReview.upsert({
      where: { venueId_userId: { venueId, userId } },
      update: { rating, comment },
      create: { venueId, userId, rating, comment }
    });

    // Fire and forget AI summary generation
    this.generateAiSummary(venueId).catch(err => StructuredLogger.error('Failed to generate AI summary', undefined, err));

    await activityService.logActivity(userId, 'VENUE_REVIEWED', venueId, 'Venue', { rating });

    return review;
  }

  async deleteReview(reviewId: string, userId: string, userRole: string) {
    const review = await prisma.venueReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error('Review not found');

    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    return prisma.venueReview.delete({ where: { id: reviewId } });
  }

  async verifyVenue(id: string, status: VenueStatus, adminRole: string) {
    if (adminRole !== 'ADMIN') throw new Error('Unauthorized');

    return prisma.venue.update({
      where: { id },
      data: { status }
    });
  }

  async generateAiSummary(id: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: { reviews: { select: { comment: true } } }
    });

    if (!venue) throw new Error('Venue not found');

    const reviewTexts = venue.reviews
      .map((r: any) => r.comment)
      .filter((c: any) => c !== null) as string[];

    if (reviewTexts.length === 0) return null;

    const summary = await aiService.summarizeReviews(reviewTexts);

    if (summary) {
      await prisma.venue.update({
        where: { id },
        data: { aiSummary: summary }
      });
    }

    return summary;
  }
}

export const venueService = new VenueService();
