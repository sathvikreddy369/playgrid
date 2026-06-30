import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const conversations = await messageService.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const otherUserId = (req.params.otherUserId as string);
      const cursor = req.query.cursor as string;
      
      const result = await messageService.getMessagesWithUser(userId, otherUserId, cursor);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const otherUserId = (req.params.otherUserId as string);
      
      const result = await messageService.markAsRead(userId, otherUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
