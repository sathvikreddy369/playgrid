"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = exports.MessageService = void 0;
const db_1 = __importDefault(require("../utils/db"));
class MessageService {
    async getConversations(userId) {
        // A query to find all users this user has messaged.
        // In Prisma, we can find distinct senderId/receiverId where one is the current user.
        // However, finding the "latest message" for each conversation is tricky in Prisma natively.
        // We'll fetch all messages involving the user, ordered by date desc, and manually group them.
        const messages = await db_1.default.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                receiver: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
            }
        });
        const conversationsMap = new Map();
        for (const msg of messages) {
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!conversationsMap.has(otherUser.id)) {
                conversationsMap.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
            // Count unread messages sent TO the current user
            if (msg.receiverId === userId && !msg.isRead) {
                const conv = conversationsMap.get(otherUser.id);
                conv.unreadCount += 1;
            }
        }
        return Array.from(conversationsMap.values());
    }
    async getMessagesWithUser(userId, otherUserId, cursor) {
        const take = 50;
        const where = {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        };
        const messages = await db_1.default.message.findMany({
            where,
            take,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
            }
        });
        return {
            messages: messages.reverse(), // Return chronological order
            nextCursor: messages.length === take ? messages[messages.length - 1].id : null
        };
    }
    async markAsRead(userId, otherUserId) {
        return db_1.default.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });
    }
}
exports.MessageService = MessageService;
exports.messageService = new MessageService();
