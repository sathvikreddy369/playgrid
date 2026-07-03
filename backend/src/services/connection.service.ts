import prisma from '../utils/db';
import { AppError } from '../utils/AppError';
import { ConnectionStatus, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service';
import { activityService } from './activity.service';

export class ConnectionService {
  async getConnections(userId: string) {
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, profile: { select: { avatarUrl: true } }, isOnline: true, lastActive: true } },
        recipient: { select: { id: true, name: true, profile: { select: { avatarUrl: true } }, isOnline: true, lastActive: true } },
      }
    });
    
    return connections.map(conn => {
      const isRequester = conn.requesterId === userId;
      return {
        ...conn,
        friend: isRequester ? conn.recipient : conn.requester,
        isRequester
      };
    });
  }

  async sendRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw AppError.badRequest('You cannot connect with yourself');
    }

    const existing = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId }
        ]
      }
    });

    if (existing) {
      throw AppError.badRequest(`Connection already exists with status: ${existing.status}`);
    }

    const connection = await prisma.userConnection.create({
      data: { requesterId, recipientId, status: ConnectionStatus.PENDING },
      include: { requester: { select: { name: true } } }
    });

    await notificationService.createNotification({
      userId: recipientId,
      type: NotificationType.CONNECTION_REQUEST,
      content: `${connection.requester.name} sent you a connection request.`,
      link: `/profile/${requesterId}`
    });

    return connection;
  }

  async acceptRequest(userId: string, requesterId: string) {
    const connection = await prisma.userConnection.findFirst({
      where: { requesterId, recipientId: userId, status: ConnectionStatus.PENDING },
      include: { recipient: { select: { name: true } } }
    });

    if (!connection) throw AppError.notFound('Connection request not found');

    const updated = await prisma.userConnection.update({
      where: { id: connection.id },
      data: { status: ConnectionStatus.ACCEPTED }
    });

    await notificationService.createNotification({
      userId: requesterId,
      type: NotificationType.CONNECTION_ACCEPTED,
      content: `${connection.recipient.name} accepted your connection request.`,
      link: `/profile/${userId}`
    });
    
    await activityService.logActivity(userId, 'FRIEND_ADDED', requesterId, 'User', { name: connection.recipient.name });
    await activityService.logActivity(requesterId, 'FRIEND_ADDED', userId, 'User', { name: connection.recipient.name });

    return updated;
  }

  async rejectRequest(userId: string, requesterId: string) {
    const connection = await prisma.userConnection.findFirst({
      where: { requesterId, recipientId: userId, status: ConnectionStatus.PENDING }
    });

    if (!connection) throw AppError.notFound('Connection request not found');

    await prisma.userConnection.delete({ where: { id: connection.id } });
    return { success: true };
  }

  async removeConnection(userId: string, otherUserId: string) {
    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, recipientId: otherUserId },
          { requesterId: otherUserId, recipientId: userId }
        ]
      }
    });

    if (!connection) throw AppError.notFound('Connection not found');

    await prisma.userConnection.delete({ where: { id: connection.id } });
    return { success: true };
  }
}

export const connectionService = new ConnectionService();
