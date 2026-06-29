import { NotificationType } from '@prisma/client';
export declare class NotificationService {
    getUnreadNotifications(userId: string): Promise<{
        link: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }[]>;
    getAllNotifications(userId: string): Promise<{
        link: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<{
        link: string | null;
        id: string;
        createdAt: Date;
        userId: string;
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
        link: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        content: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
    }>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map