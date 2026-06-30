"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const db_1 = __importDefault(require("../utils/db"));
class NotificationService {
    async getUnreadNotifications(userId) {
        return db_1.default.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllNotifications(userId) {
        return db_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markAsRead(notificationId, userId) {
        // Ensure the notification belongs to the user
        const notification = await db_1.default.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification || notification.userId !== userId) {
            throw new Error('Notification not found or unauthorized');
        }
        return db_1.default.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return db_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    // Internal helper for other services to emit notifications
    async createNotification(data) {
        return db_1.default.notification.create({
            data
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
