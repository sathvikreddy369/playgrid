import { Request, Response } from 'express';
import { matchService } from '../services/match.service';
import { aiService } from '../services/ai.service';
import prisma from '../utils/db';

export class MatchController {
  async getRecommendations(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createMatch(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const match = await matchService.createMatch(userId, req.body);
      res.status(201).json(match);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMatches(req: Request, res: Response) {
    try {
      const matches = await matchService.getMatches(req.query);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMatchById(req: Request, res: Response) {
    try {
      const match = await matchService.getMatchById((req.params.id as string));
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async requestToJoin(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const player = await matchService.requestToJoin((req.params.id as string), userId);
      res.status(201).json(player);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approvePlayer(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.handleJoinRequest((req.params.id as string), creatorId, (req.params.userId as string), 'APPROVED');
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async rejectPlayer(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.handleJoinRequest((req.params.id as string), creatorId, (req.params.userId as string), 'REJECTED');
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAttendance(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const { rating } = req.body;
      const result = await matchService.markAttendance((req.params.id as string), creatorId, (req.params.userId as string), rating);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelMatch(req: Request, res: Response) {
    try {
      const creatorId = req.user!.id;
      const result = await matchService.cancelMatch((req.params.id as string), creatorId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const matchController = new MatchController();
