import prisma from '../utils/db';
import { ReviewType } from '@prisma/client';
import { trustService } from './trust.service';

export class ReviewService {
  
  async createReview(reviewerId: string, targetId: string, matchId: string, rating: number, comment: string | null, type: ReviewType) {
    if (reviewerId === targetId) {
      throw new Error('Self reviews are not allowed');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Verify participation
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true
      }
    });

    if (!match || match.status !== 'COMPLETED') {
      throw new Error('Can only review completed matches');
    }

    const reviewerPlayer = match.players.find(p => p.userId === reviewerId);
    const targetPlayer = match.players.find(p => p.userId === targetId);

    // Both must have attended
    if (
      !reviewerPlayer || reviewerPlayer.status !== 'ATTENDED' ||
      !targetPlayer || targetPlayer.status !== 'ATTENDED'
    ) {
      // Allow host review even if host wasn't technically a "player", but host must be the creator.
      const isTargetHost = type === ReviewType.HOST && match.creatorId === targetId;
      const didReviewerAttend = reviewerPlayer && reviewerPlayer.status === 'ATTENDED';

      if (!(isTargetHost && didReviewerAttend)) {
        throw new Error('Both users must have participated in the match to leave a review');
      }
    }

    const existingReview = await prisma.userReview.findUnique({
      where: {
        reviewerId_targetId_matchId: {
          reviewerId,
          targetId,
          matchId
        }
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this user for this match');
    }

    const review = await prisma.userReview.create({
      data: {
        reviewerId,
        targetId,
        matchId,
        rating,
        comment,
        type
      }
    });

    // Update trust score
    await trustService.processReview(targetId, rating, type);

    return review;
  }
}

export const reviewService = new ReviewService();
