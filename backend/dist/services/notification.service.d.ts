import { NotificationType } from '@prisma/client';
export declare class NotificationService {
    getUnreadNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        link: string | null;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }[]>;
    getAllNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        link: string | null;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        link: string | null;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createNotification(data: {
        userId: string;
        type: NotificationType;
        content: string;
        link?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        link: string | null;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map