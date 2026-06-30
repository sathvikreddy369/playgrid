import { Request, Response, NextFunction } from 'express';
import { groundService } from '../services/ground.service';
import { GroundStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';

export class GroundController {
  async createGround(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ground = await groundService.createGround(userId, req.body);
      res.status(201).json(ground);
    } catch (error) {
      next(error);
    }
  }

  async getGrounds(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as GroundStatus;
      const grounds = await groundService.getGrounds(status);
      res.json(grounds);
    } catch (error) {
      next(error);
    }
  }

  async getGroundById(req: Request, res: Response, next: NextFunction) {
    try {
      const ground = await groundService.getGroundById((req.params.id as string));
      if (!ground) {
        throw AppError.notFound('Ground not found');
      }
      res.json(ground);
    } catch (error) {
      next(error);
    }
  }

  async updateGround(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ground = await groundService.updateGround((req.params.id as string), userId, req.body);
      res.json(ground);
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { rating, comment } = req.body;
      const review = await groundService.addReview((req.params.id as string), userId, rating, comment);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      await groundService.deleteReview((req.params.reviewId as string), userId, userRole);
      res.json({ message: 'Review deleted' });
    } catch (error) {
      next(error);
    }
  }

  async verifyGround(req: Request, res: Response, next: NextFunction) {
    try {
      const adminRole = req.user!.role;
      const { status } = req.body;
      const ground = await groundService.verifyGround((req.params.id as string), status, adminRole);
      res.json(ground);
    } catch (error) {
      next(error);
    }
  }
}

export const groundController = new GroundController();
