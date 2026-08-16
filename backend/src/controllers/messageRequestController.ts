import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const sendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { receiverId } = req.body;

    if (!receiverId) return res.status(400).json({ error: 'Receiver ID is required' });
    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'You cannot send a message request to yourself' });
    }

    // Check receiver profile message preference
    const receiverProfile = await prisma.profile.findUnique({
      where: { userId: receiverId }
    });

    if (receiverProfile && receiverProfile.allowMessageRequests === false) {
      return res.status(400).json({ error: 'This user is not accepting new message requests right now' });
    }

    const existingRequest = await prisma.messageRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: req.user.id,
          receiverId
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'ACCEPTED') {
        return res.json({ messageRequest: existingRequest, message: 'Message request already accepted' });
      }
      if (existingRequest.status === 'PENDING') {
        return res.status(400).json({ error: 'Message request is already pending approval' });
      }
      // If DECLINED, reset to PENDING
      const updated = await prisma.messageRequest.update({
        where: { id: existingRequest.id },
        data: { status: 'PENDING' }
      });
      return res.json({ messageRequest: updated });
    }

    const msgRequest = await prisma.messageRequest.create({
      data: {
        senderId: req.user.id,
        receiverId,
        status: 'PENDING'
      }
    });

    // Notify receiver
    const senderName = req.user.email.split('@')[0];
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message Request 💬',
        body: `${senderName} wants to start a conversation with you.`,
        link: '/messages'
      }
    });

    res.status(201).json({ messageRequest: msgRequest });
  } catch (error) {
    console.error('Error sending message request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncomingRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const requests = await prisma.messageRequest.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: {
        sender: { include: { profile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching message requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleRequestAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const requestId = req.params.id as string;
    const { action } = req.body; // 'ACCEPTED' | 'DECLINED'

    if (action !== 'ACCEPTED' && action !== 'DECLINED') {
      return res.status(400).json({ error: 'Invalid action. Must be ACCEPTED or DECLINED.' });
    }

    const msgReq = await prisma.messageRequest.findUnique({
      where: { id: requestId }
    });

    if (!msgReq) return res.status(404).json({ error: 'Message request not found' });
    if (msgReq.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.messageRequest.update({
      where: { id: requestId },
      data: { status: action }
    });

    if (action === 'ACCEPTED') {
      await prisma.notification.create({
        data: {
          userId: msgReq.senderId,
          title: 'Message Request Accepted! 🎉',
          body: 'Your message request was accepted. You can now chat directly.',
          link: '/messages'
        }
      });
    }

    res.json({ messageRequest: updated });
  } catch (error) {
    console.error('Error handling message request action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
