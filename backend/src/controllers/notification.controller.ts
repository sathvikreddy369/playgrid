import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const unreadOnly = req.query.unread === 'true';
      
      const notifications = unreadOnly 
        ? await notificationService.getUnreadNotifications(userId)
        : await notificationService.getAllNotifications(userId);
        
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const notification = await notificationService.markAsRead((req.params.id as string), userId);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await notificationService.markAllAsRead(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const notificationController = new NotificationController();
