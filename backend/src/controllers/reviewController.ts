import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;
    const { rating, comment } = req.body;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        requests: true
      }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });
    
    if (match.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed matches' });
    }

    // Verify the user actually attended/was accepted to the match
    const isParticipant = (match as any).requests?.some(
      (r: any) => r.userId === req.user?.id && r.status === 'ACCEPTED'
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Only participants can leave a review' });
    }

    const review = await prisma.review.create({
      data: {
        matchId,
        authorId: req.user.id,
        hostId: match.hostId,
        rating,
        comment
      }
    });

    res.status(201).json({ review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;
    const { userId, attended } = req.body; // boolean

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });
    
    if (match.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Only the host can mark attendance' });
    }

    // Update the participant's profile stats
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        matchesAttended: attended ? { increment: 1 } : undefined,
        matchesCancelled: !attended ? { increment: 1 } : undefined
      }
    });

    res.json({ message: 'Attendance updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
