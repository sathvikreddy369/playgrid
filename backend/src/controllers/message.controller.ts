import { Request, Response } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const conversations = await messageService.getConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const otherUserId = (req.params.otherUserId as string);
      const cursor = req.query.cursor as string;
      
      const result = await messageService.getMessagesWithUser(userId, otherUserId, cursor);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const otherUserId = (req.params.otherUserId as string);
      
      const result = await messageService.markAsRead(userId, otherUserId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const messageController = new MessageController();
