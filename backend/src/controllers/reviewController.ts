import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const matchId = req.params.matchId as string;
    const { rating, comment } = req.body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        requests: true
      }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (match.hostId === req.user.id) {
      return res.status(400).json({ error: 'Hosts cannot submit reviews for their own hosted match' });
    }
    
    if (match.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed matches' });
    }

    // Verify the user actually attended/was accepted to the match
    const isParticipant = match.requests.some(
      r => r.userId === req.user?.id && r.status === 'ACCEPTED'
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Only accepted participants can leave a review' });
    }

    // Prevent duplicate reviews for the same match
    const existingReview = await prisma.review.findFirst({
      where: {
        matchId,
        authorId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already submitted a review for this match' });
    }

    const review = await prisma.review.create({
      data: {
        matchId,
        authorId: req.user.id,
        hostId: match.hostId,
        rating,
        comment: comment?.trim() || null
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
    const { userId, attended } = req.body;

    if (typeof attended !== 'boolean' || !userId) {
      return res.status(400).json({ error: 'Missing userId or attended boolean payload' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { requests: true }
    });

    if (!match) return res.status(404).json({ error: 'Match not found' });
    
    if (match.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Only the host can mark attendance' });
    }

    // Verify target user is an accepted participant
    const isAcceptedParticipant = match.requests.some(
      r => r.userId === userId && r.status === 'ACCEPTED'
    );

    if (!isAcceptedParticipant) {
      return res.status(400).json({ error: 'Target user is not an accepted participant of this match' });
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

