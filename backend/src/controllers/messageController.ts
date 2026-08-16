import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMatchMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;

    // Optional: check if user is participant or host before allowing them to fetch chat history
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { requests: true }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });
    
    const isHost = match.hostId === req.user.id;
    const isAcceptedParticipant = (match as any).requests?.some(
      (r: any) => r.userId === req.user?.id && r.status === 'ACCEPTED'
    );

    if (!isHost && !isAcceptedParticipant) {
      return res.status(403).json({ error: 'Only accepted participants can view chat history' });
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      take: 100 // Limit to last 100 messages for MVP
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
