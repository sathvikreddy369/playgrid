import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (match.status === 'COMPLETED' || match.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot request to join this match' });
    }

    if (new Date(match.date) < new Date()) {
      return res.status(400).json({ error: 'Match has already started or passed' });
    }

    if (match.filledSlots >= match.totalSlots) {
      return res.status(400).json({ error: 'Match is already full' });
    }

    // Upsert to handle if they already requested, prevent duplicates throwing errors
    const request = await prisma.request.upsert({
      where: {
        matchId_userId: {
          matchId,
          userId: req.user.id
        }
      },
      update: {},
      create: {
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

    // Use a transaction if accepting, to safely update slots
    if (action === 'ACCEPTED') {
      if ((request as any).match.filledSlots >= (request as any).match.totalSlots) {
        return res.status(400).json({ error: 'Match is already full' });
      }

      const [updatedRequest, updatedMatch] = await prisma.$transaction([
        prisma.request.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' }
        }),
        prisma.match.update({
          where: { id: (request as any).matchId },
          data: { 
            filledSlots: { increment: 1 },
            // If this accept fills the match, mark it FILLED
            status: (request as any).match.filledSlots + 1 >= (request as any).match.totalSlots ? 'FILLED' : undefined
          }
        })
      ]);

      return res.json({ request: updatedRequest, match: updatedMatch });
    } else {
      // Rejecting
      const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });

      // If the request was previously ACCEPTED, decrement the slots
      if (request.status === 'ACCEPTED') {
         await prisma.match.update({
           where: { id: (request as any).matchId },
           data: { 
             filledSlots: { decrement: 1 },
             status: 'AVAILABLE' // Un-fill it if it was filled
           }
         });
      }

      return res.json({ request: updatedRequest });
    }
  } catch (error) {
    console.error('Error handling request action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
