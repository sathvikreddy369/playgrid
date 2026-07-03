import { Request, Response, NextFunction } from 'express';
import { matchService } from '../services/match.service';
import prisma from '../utils/db';
import { getIO } from '../socket';
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
      
      StructuredLogger.audit('CREATE_MATCH', userId, match.id, 'SUCCESS', req.id as string);
      
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
      
      try {
        const io = getIO();
        io.to(`match:${matchId}`).emit('participant_joined', { matchId, userId: playerId });
        io.to(`match:${matchId}`).emit('match_updated', { matchId });
      } catch (e) {}
      
      StructuredLogger.audit('APPROVE_PLAYER', creatorId, matchId, 'SUCCESS', req.id as string, { playerId });
      
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
      
      StructuredLogger.audit('REJECT_PLAYER', creatorId, matchId, 'SUCCESS', req.id as string, { playerId });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async leaveMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const matchId = req.params.id as string;
      const result = await matchService.leaveMatch(matchId, userId);
      
      try {
        const io = getIO();
        io.to(`match:${matchId}`).emit('participant_left', { matchId, userId });
        io.to(`match:${matchId}`).emit('match_updated', { matchId });
      } catch (e) {}

      StructuredLogger.audit('LEAVE_MATCH', userId, matchId, 'SUCCESS', req.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async kickPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const matchId = req.params.id as string;
      const playerId = req.params.userId as string;
      const result = await matchService.kickPlayer(matchId, creatorId, playerId);
      
      try {
        const io = getIO();
        io.to(`match:${matchId}`).emit('participant_left', { matchId, userId: playerId });
        io.to(`match:${matchId}`).emit('match_updated', { matchId });
      } catch (e) {}
      
      StructuredLogger.audit('KICK_PLAYER', creatorId, matchId, 'SUCCESS', req.id as string, { playerId });
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
      
      StructuredLogger.audit('CANCEL_MATCH', creatorId, matchId, 'SUCCESS', req.id as string);
      
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

  async editComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { content } = req.body;
      const comment = await matchService.editComment(req.params.commentId, userId, content);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await matchService.deleteComment(req.params.commentId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async editMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const match = await matchService.editMatch(req.params.id, creatorId, req.body);
      res.json(match);
    } catch (error) {
      next(error);
    }
  }

  async updateMatchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const match = await matchService.updateMatchStatus(req.params.id, creatorId, req.body.status);

      try {
        const io = getIO();
        io.to(`match:${req.params.id}`).emit('match_updated', { matchId: req.params.id, status: req.body.status });
      } catch (e) {}

      res.json(match);
    } catch (error) {
      next(error);
    }
  }

  async broadcastMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.broadcastMessage(req.params.id, creatorId, req.body.content);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { rating, comment } = req.body;
      const review = await matchService.addReview(req.params.id, userId, rating, comment);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }
}

export const matchController = new MatchController();
