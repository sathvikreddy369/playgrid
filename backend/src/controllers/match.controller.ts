import { Request, Response, NextFunction } from 'express';
import { matchService } from '../services/match.service';
import { aiService } from '../services/ai.service';
import prisma from '../utils/db';
import { AppError } from '../utils/AppError';

export class MatchController {
  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });
      if (!user?.profile) return res.json([]);

      // Fetch upcoming open matches
      const matches = await prisma.match.findMany({
        where: { status: 'OPEN', date: { gte: new Date() } },
        include: { creator: { select: { name: true } }, _count: { select: { players: true } } },
        take: 20
      });

      const recommendations = await aiService.getRecommendations(user.profile, matches);
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  async createMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const match = await matchService.createMatch(userId, req.body);
      res.status(201).json(match);
    } catch (error) {
      next(error);
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await matchService.getMatches(req.query);
      res.json(matches);
    } catch (error) {
      next(error);
    }
  }

  async getMatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const match = await matchService.getMatchById((req.params.id as string));
      if (!match) throw AppError.notFound('Match not found');
      res.json(match);
    } catch (error) {
      next(error);
    }
  }

  async requestToJoin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const player = await matchService.requestToJoin((req.params.id as string), userId);
      res.status(201).json(player);
    } catch (error) {
      next(error);
    }
  }

  async approvePlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.handleJoinRequest((req.params.id as string), creatorId, (req.params.userId as string), 'APPROVED');
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.handleJoinRequest((req.params.id as string), creatorId, (req.params.userId as string), 'REJECTED');
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const { rating } = req.body;
      const result = await matchService.markAttendance((req.params.id as string), creatorId, (req.params.userId as string), rating);
      
      // Evaluate badges after attendance
      const { badgeService } = await import('../services/badge.service');
      await badgeService.evaluateUserMatches((req.params.userId as string));
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async cancelMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.cancelMatch((req.params.id as string), creatorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { content } = req.body;
      const comment = await matchService.addComment((req.params.id as string), userId, content);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }
}

export const matchController = new MatchController();
