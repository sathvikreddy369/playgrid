import prisma from '../utils/db';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  async getUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // Internal helper for other services to emit notifications
  async createNotification(data: { userId: string; type: NotificationType; content: string; link?: string }) {
    const notification = await prisma.notification.create({
      data
    });

    try {
      const { getIO } = await import('../socket');
      const io = getIO();
      io.to(`user:${data.userId}`).emit('new_notification', notification);
    } catch (err) {
      // Ignored if socket.io is not initialized (e.g., in test or seed environments)
    }

    return notification;
  }
}

export const notificationService = new NotificationService();
