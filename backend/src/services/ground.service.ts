import prisma from '../utils/db';
import { GroundStatus } from '@prisma/client';
import { aiService } from './ai.service';
import { activityService } from './activity.service';

export class GroundService {
  async createGround(userId: string, data: any) {
    return prisma.ground.create({
      data: {
        name: data.name,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        pricing: data.pricing,
        amenities: data.amenities || [],
        sports: data.sports || [],
        photos: data.photos || [],
        contactPhone: data.contactPhone,
        status: GroundStatus.PENDING,
        ownerId: userId,
      },
    });
  }

  async getGrounds(filters?: { status?: GroundStatus; sport?: string; location?: string; minRating?: number }) {
    const where: any = { status: filters?.status || GroundStatus.VERIFIED };
    
    if (filters?.sport) {
      where.sports = { has: filters.sport };
    }
    if (filters?.location) {
      where.OR = [
        { location: { contains: filters.location, mode: 'insensitive' } },
        { city: { contains: filters.location, mode: 'insensitive' } }
      ];
    }

    const grounds = await prisma.ground.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = grounds.map(g => {
      const totalRating = g.reviews.reduce((sum, rev) => sum + rev.rating, 0);
      const avgRating = g.reviews.length > 0 ? parseFloat((totalRating / g.reviews.length).toFixed(1)) : 0;
      
      const { reviews, ...groundWithoutReviews } = g;
      return { ...groundWithoutReviews, avgRating };
    });

    if (filters?.minRating) {
      return formatted.filter(g => g.avgRating >= filters.minRating!);
    }

    return formatted;
  }

  async getGroundById(id: string) {
    const ground = await prisma.ground.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { reviews: true } }
      }
    });

    if (!ground) return null;

    // Calculate average rating
    const totalRating = ground.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0);
    const avgRating = ground.reviews.length > 0 ? (totalRating / ground.reviews.length).toFixed(1) : 0;

    return { ...ground, avgRating };
  }

  async updateGround(id: string, userId: string, data: any) {
    const ground = await prisma.ground.findUnique({ where: { id } });
    if (!ground) throw new Error('Ground not found');
    if (ground.ownerId !== userId) throw new Error('Unauthorized');

    return prisma.ground.update({
      where: { id },
      data,
    });
  }

  async addReview(groundId: string, userId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    
    // Upsert to handle the unique constraint (one review per user per ground)
    const review = await prisma.groundReview.upsert({
      where: { groundId_userId: { groundId, userId } },
      update: { rating, comment },
      create: { groundId, userId, rating, comment }
    });

    // Fire and forget AI summary generation
    this.generateAiSummary(groundId).catch(err => console.error('Failed to generate AI summary:', err));

    await activityService.logActivity(userId, 'GROUND_REVIEWED', groundId, 'Ground', { rating });

    return review;
  }

  async deleteReview(reviewId: string, userId: string, userRole: string) {
    const review = await prisma.groundReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error('Review not found');

    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    return prisma.groundReview.delete({ where: { id: reviewId } });
  }

  async verifyGround(id: string, status: GroundStatus, adminRole: string) {
    if (adminRole !== 'ADMIN') throw new Error('Unauthorized');

    return prisma.ground.update({
      where: { id },
      data: { status }
    });
  }

  async generateAiSummary(id: string) {
    const ground = await prisma.ground.findUnique({
      where: { id },
      include: { reviews: { select: { comment: true } } }
    });

    if (!ground) throw new Error('Ground not found');

    const reviewTexts = ground.reviews
      .map(r => r.comment)
      .filter(c => c !== null) as string[];

    if (reviewTexts.length === 0) return null;

    const summary = await aiService.summarizeReviews(reviewTexts);

    await prisma.ground.update({
      where: { id },
      data: { aiSummary: summary }
    });

    return summary;
  }
}

export const groundService = new GroundService();
