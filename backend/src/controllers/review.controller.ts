import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.id;
      const targetId = req.params.targetId as string;
      const matchId = req.params.matchId as string;
      const { rating, comment, type } = req.body;
      
      const review = await reviewService.createReview(reviewerId, targetId, matchId, rating, comment, type);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
