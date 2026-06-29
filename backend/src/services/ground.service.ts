import prisma from '../utils/db';
import { GroundStatus } from '@prisma/client';

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

  async getGrounds(status?: GroundStatus) {
    return prisma.ground.findMany({
      where: status ? { status } : { status: GroundStatus.VERIFIED },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
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
    return prisma.groundReview.upsert({
      where: { groundId_userId: { groundId, userId } },
      update: { rating, comment },
      create: { groundId, userId, rating, comment }
    });
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
}

export const groundService = new GroundService();
