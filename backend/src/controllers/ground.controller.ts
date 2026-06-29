import { Request, Response } from 'express';
import { groundService } from '../services/ground.service';
import { GroundStatus } from '@prisma/client';

export class GroundController {
  async createGround(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const ground = await groundService.createGround(userId, req.body);
      res.status(201).json(ground);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getGrounds(req: Request, res: Response) {
    try {
      const status = req.query.status as GroundStatus;
      const grounds = await groundService.getGrounds(status);
      res.json(grounds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getGroundById(req: Request, res: Response) {
    try {
      const ground = await groundService.getGroundById((req.params.id as string));
      if (!ground) {
        return res.status(404).json({ error: 'Ground not found' });
      }
      res.json(ground);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateGround(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const ground = await groundService.updateGround((req.params.id as string), userId, req.body);
      res.json(ground);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addReview(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { rating, comment } = req.body;
      const review = await groundService.addReview((req.params.id as string), userId, rating, comment);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      await groundService.deleteReview((req.params.reviewId as string), userId, userRole);
      res.json({ message: 'Review deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyGround(req: Request, res: Response) {
    try {
      const adminRole = req.user!.role;
      const { status } = req.body;
      const ground = await groundService.verifyGround((req.params.id as string), status, adminRole);
      res.json(ground);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const groundController = new GroundController();
