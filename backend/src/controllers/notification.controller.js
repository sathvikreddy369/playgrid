"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationController {
    async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const unreadOnly = req.query.unread === 'true';
            const notifications = unreadOnly
                ? await notification_service_1.notificationService.getUnreadNotifications(userId)
                : await notification_service_1.notificationService.getAllNotifications(userId);
            res.json(notifications);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const notification = await notification_service_1.notificationService.markAsRead(req.params.id, userId);
            res.json(notification);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            const result = await notification_service_1.notificationService.markAllAsRead(userId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map