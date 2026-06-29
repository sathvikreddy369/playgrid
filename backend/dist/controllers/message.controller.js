"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = exports.MessageController = void 0;
const message_service_1 = require("../services/message.service");
class MessageController {
    async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const conversations = await message_service_1.messageService.getConversations(userId);
            res.json(conversations);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getMessages(req, res) {
        try {
            const userId = req.user.id;
            const otherUserId = req.params.otherUserId;
            const cursor = req.query.cursor;
            const result = await message_service_1.messageService.getMessagesWithUser(userId, otherUserId, cursor);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const otherUserId = req.params.otherUserId;
            const result = await message_service_1.messageService.markAsRead(userId, otherUserId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MessageController = MessageController;
exports.messageController = new MessageController();
//# sourceMappingURL=message.controller.js.map