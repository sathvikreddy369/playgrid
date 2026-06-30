import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const unreadOnly = req.query.unread === 'true';
      
      const notifications = unreadOnly 
        ? await notificationService.getUnreadNotifications(userId)
        : await notificationService.getAllNotifications(userId);
        
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notification = await notificationService.markAsRead((req.params.id as string), userId);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await notificationService.markAllAsRead(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
