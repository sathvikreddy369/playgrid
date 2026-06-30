import { Request, Response, NextFunction } from 'express';
import { matchService } from '../services/match.service';
import prisma from '../utils/db';
import { AppError } from '../utils/AppError';
import { StructuredLogger } from '../utils/logger';

export class MatchController {
  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });
      if (!user?.profile) return res.json([]);

      const recommendations = await matchService.getRecommendations(user.profile);
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  async createMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const match = await matchService.createMatch(userId, req.body);
      
      StructuredLogger.audit('CREATE_MATCH', userId, match.id, 'SUCCESS', req.id);
      
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
      const matchId = req.params.id as string;
      const playerId = req.params.userId as string;
      const result = await matchService.handleJoinRequest(matchId, creatorId, playerId, 'APPROVED');
      
      StructuredLogger.audit('APPROVE_PLAYER', creatorId, matchId, 'SUCCESS', req.id, { playerId });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const matchId = req.params.id as string;
      const playerId = req.params.userId as string;
      const result = await matchService.handleJoinRequest(matchId, creatorId, playerId, 'REJECTED');
      
      StructuredLogger.audit('REJECT_PLAYER', creatorId, matchId, 'SUCCESS', req.id, { playerId });
      
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
      const matchId = req.params.id as string;
      const result = await matchService.cancelMatch(matchId, creatorId);
      
      StructuredLogger.audit('CANCEL_MATCH', creatorId, matchId, 'SUCCESS', req.id);
      
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
