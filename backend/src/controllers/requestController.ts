import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (match.hostId === req.user.id) {
      return res.status(400).json({ error: 'Hosts cannot request to join their own match' });
    }

    if (match.status === 'COMPLETED' || match.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot request to join this match' });
    }

    if (new Date(match.date) < new Date()) {
      return res.status(400).json({ error: 'Match has already started or passed' });
    }

    if (match.filledSlots >= match.totalSlots) {
      return res.status(400).json({ error: 'Match is already full' });
    }

    const existingRequest = await prisma.request.findUnique({
      where: {
        matchId_userId: {
          matchId,
          userId: req.user.id
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'ACCEPTED') {
        return res.status(400).json({ error: 'You are already an accepted participant in this match' });
      }
      if (existingRequest.status === 'PENDING') {
        return res.status(400).json({ error: 'You already have a pending join request for this match' });
      }
      // If REJECTED, reset to PENDING so user can re-apply
      const updatedRequest = await prisma.request.update({
        where: { id: existingRequest.id },
        data: { status: 'PENDING' }
      });
      return res.json({ request: updatedRequest });
    }

    const request = await prisma.request.create({
      data: {
        matchId,
        userId: req.user.id,
        status: 'PENDING'
      }
    });

    res.status(201).json({ request });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHostRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    
    if (match.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not the host of this match' });
    }

    const requests = await prisma.request.findMany({
      where: { matchId },
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching host requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleRequestAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const requestId = req.params.requestId as string;
    const { action } = req.body; // 'ACCEPTED' or 'REJECTED'

    if (action !== 'ACCEPTED' && action !== 'REJECTED') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Find the request and the associated match in one go, verifying host permissions
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { match: true }
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    if ((request as any).match.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not the host' });
    }

    if (request.status === action) {
      return res.status(400).json({ error: `Request is already ${action}` });
    }

    if (new Date((request as any).match.date) < new Date()) {
      return res.status(400).json({ error: 'Cannot modify requests for a match that has already started' });
    }

    // Use a transaction if accepting, to safely update slots atomically
    if (action === 'ACCEPTED') {
      try {
        const result = await prisma.$transaction(async (tx) => {
          const match = await tx.match.findUnique({ where: { id: request.matchId } });
          if (!match) throw new Error('MATCH_NOT_FOUND');
          if (match.filledSlots >= match.totalSlots) {
            throw new Error('MATCH_FULL');
          }

          const isNowFull = match.filledSlots + 1 >= match.totalSlots;

          const updatedMatch = await tx.match.update({
            where: { id: request.matchId },
            data: {
              filledSlots: { increment: 1 },
              status: isNowFull ? 'FILLED' : match.status
            }
          });

          const updatedRequest = await tx.request.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
          });

          await tx.notification.create({
            data: {
              userId: request.userId,
              title: 'Request Accepted! 🎉',
              body: `Your request to join "${match.title}" has been accepted by the host.`,
              link: `/match/${match.id}`
            }
          });

          return { updatedMatch, updatedRequest };
        });

        return res.json({ request: result.updatedRequest, match: result.updatedMatch });
      } catch (err: any) {
        if (err.message === 'MATCH_FULL') {
          return res.status(400).json({ error: 'Match capacity reached. Cannot accept more players.' });
        }
        throw err;
      }
    } else {
      const result = await prisma.request.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });

      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: 'Request Update',
          body: `Your request to join "${(request as any).match.title}" was not accepted.`,
          link: `/match/${request.matchId}`
        }
      });

      return res.json({ request: result });
    }
  } catch (error) {
    console.error('Error handling request action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const withdrawRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;

    const existingRequest = await prisma.request.findUnique({
      where: {
        matchId_userId: {
          matchId,
          userId: req.user.id
        }
      }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    if (existingRequest.status === 'ACCEPTED') {
      await prisma.$transaction(async (tx) => {
        await tx.request.delete({
          where: { id: existingRequest.id }
        });
        const currentMatch = await tx.match.findUnique({ where: { id: matchId } });
        if (currentMatch) {
          const nextFilled = Math.max(0, currentMatch.filledSlots - 1);
          const nextStatus = (currentMatch.status === 'FILLED' && nextFilled < currentMatch.totalSlots)
            ? 'AVAILABLE'
            : currentMatch.status;
            
          await tx.match.update({
            where: { id: matchId },
            data: {
              filledSlots: nextFilled,
              status: nextStatus
            }
          });
        }
      });
    } else {
      await prisma.request.delete({
        where: { id: existingRequest.id }
      });
    }

    res.json({ message: 'Request withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
