import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../utils/AppError';

export class TournamentController {
  async getTournaments(req: Request, res: Response, next: NextFunction) {
    try {
      const tournaments = await prisma.tournament.findMany({
        include: {
          organizer: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
          _count: { select: { participants: true } }
        },
        orderBy: { startDate: 'asc' }
      });
      res.json(tournaments);
    } catch (error) {
      next(error);
    }
  }

  async getTournamentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
          organizer: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
          participants: {
            include: { user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } } }
          }
        }
      });
      if (!tournament) throw AppError.notFound('Tournament not found');
      res.json(tournament);
    } catch (error) {
      next(error);
    }
  }

  async createTournament(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized('User not found');
      const data = req.body;
      const tournament = await prisma.tournament.create({
        data: {
          ...data,
          entryFee: data.entryFee ? Number(data.entryFee) : null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          organizerId: req.user.id
        }
      });
      res.status(201).json(tournament);
    } catch (error) {
      next(error);
    }
  }

  async joinTournament(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw AppError.unauthorized('User not found');
      const id = req.params.id as string;
      
      const tournament = await prisma.tournament.findUnique({ where: { id } });
      if (!tournament) throw AppError.notFound('Tournament not found');

      const existing = await prisma.tournamentParticipant.findUnique({
        where: { tournamentId_userId: { tournamentId: id, userId: req.user.id } }
      });

      if (existing) throw AppError.badRequest('Already joined this tournament');

      const participant = await prisma.tournamentParticipant.create({
        data: {
          tournamentId: id,
          userId: req.user.id,
          status: 'PENDING'
        }
      });
      res.status(201).json(participant);
    } catch (error) {
      next(error);
    }
  }
}

export const tournamentController = new TournamentController();
