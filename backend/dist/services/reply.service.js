"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyService = exports.ReplyService = void 0;
const db_1 = __importDefault(require("../utils/db"));
const fraudDetection_1 = require("../utils/fraudDetection");
class ReplyService {
    async createReply(userId, postId, content, parentId) {
        if (fraudDetection_1.FraudDetection.containsProfanityOrSpam(content)) {
            throw new Error('Content flagged as spam or contains profanity.');
        }
        // Ensure post exists
        const post = await db_1.default.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new Error('Post not found');
        if (parentId) {
            // Ensure parent reply exists and belongs to the same post
            const parent = await db_1.default.reply.findUnique({ where: { id: parentId } });
            if (!parent || parent.postId !== postId) {
                throw new Error('Invalid parent reply');
            }
        }
        return db_1.default.reply.create({
            data: {
                content,
                postId,
                authorId: userId,
                parentId,
            },
        });
    }
    async deleteReply(replyId, userId, userRole) {
        const reply = await db_1.default.reply.findUnique({ where: { id: replyId } });
        if (!reply)
            throw new Error('Reply not found');
        if (reply.authorId !== userId && userRole !== 'ADMIN') {
            throw new Error('Unauthorized to delete this reply');
        }
        return db_1.default.reply.delete({ where: { id: replyId } });
    }
    async toggleLike(replyId, userId) {
        const existingLike = await db_1.default.replyLike.findUnique({
            where: { userId_replyId: { userId, replyId } },
        });
        if (existingLike) {
            await db_1.default.replyLike.delete({ where: { id: existingLike.id } });
            return { liked: false };
        }
        else {
            await db_1.default.replyLike.create({ data: { userId, replyId } });
            return { liked: true };
        }
    }
}
exports.ReplyService = ReplyService;
exports.replyService = new ReplyService();
