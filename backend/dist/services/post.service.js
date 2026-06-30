"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
const fraudDetection_1 = require("../utils/fraudDetection");
const ai_service_1 = require("./ai.service");
class PostService {
    async getPosts(filters, cursor, limit = 10) {
        const where = {};
        if (filters.type)
            where.type = filters.type;
        if (filters.communityId)
            where.communityId = filters.communityId;
        if (filters.authorId)
            where.authorId = filters.authorId;
        const posts = await db_1.default.post.findMany({
            where,
            take: limit + 1, // Fetch one extra to determine if there's a next page
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, profile: { select: { avatarUrl: true } } },
                },
                _count: {
                    select: { replies: true, likes: true },
                },
            },
        });
        let nextCursor = undefined;
        if (posts.length > limit) {
            const nextItem = posts.pop(); // Remove the extra item
            nextCursor = nextItem?.id;
        }
        return { posts, nextCursor };
    }
    async getPostById(postId, userId) {
        const post = await db_1.default.post.findUnique({
            where: { id: postId },
            include: {
                author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                        _count: { select: { likes: true, replies: true } },
                    },
                },
                _count: { select: { likes: true, replies: true } },
                // If logged in, check if user liked/saved this post
                ...(userId && {
                    likes: { where: { userId } },
                    savedBy: { where: { userId } },
                }),
            },
        });
        return post;
    }
    async createPost(userId, data) {
        if (fraudDetection_1.FraudDetection.containsProfanityOrSpam(data.content)) {
            throw new Error('Content flagged as spam or contains profanity.');
        }
        const aiCheck = await ai_service_1.aiService.moderateContent(data.content);
        if (aiCheck.isSpam) {
            throw new Error(`Content blocked by AI Moderator: ${aiCheck.reason}`);
        }
        if (await fraudDetection_1.FraudDetection.isDuplicatePost(userId, data.content)) {
            throw new Error('Duplicate post detected. Please wait before posting again.');
        }
        return db_1.default.post.create({
            data: {
                authorId: userId,
                content: data.content,
                type: data.type || client_1.PostType.GENERAL,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                tags: data.tags || [],
            },
        });
    }
    async updatePost(postId, userId, content) {
        const post = await db_1.default.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new Error('Post not found');
        if (post.authorId !== userId)
            throw new Error('Unauthorized');
        if (fraudDetection_1.FraudDetection.containsProfanityOrSpam(content)) {
            throw new Error('Content flagged as spam or contains profanity.');
        }
        return db_1.default.post.update({
            where: { id: postId },
            data: { content, isEdited: true },
        });
    }
    async deletePost(postId, userId, userRole) {
        const post = await db_1.default.post.findUnique({
            where: { id: postId },
            include: { community: true }
        });
        if (!post)
            throw new Error('Post not found');
        const isAuthor = post.authorId === userId;
        const isAdmin = userRole === 'ADMIN';
        const isCommunityOwner = post.community?.ownerId === userId;
        if (!isAuthor && !isAdmin && !isCommunityOwner) {
            throw new Error('Unauthorized to delete this post');
        }
        return db_1.default.post.delete({ where: { id: postId } });
    }
    async toggleLike(postId, userId) {
        const existingLike = await db_1.default.postLike.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        if (existingLike) {
            await db_1.default.postLike.delete({ where: { id: existingLike.id } });
            return { liked: false };
        }
        else {
            await db_1.default.postLike.create({ data: { userId, postId } });
            return { liked: true };
        }
    }
    async toggleSave(postId, userId) {
        const existingSave = await db_1.default.savedPost.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        if (existingSave) {
            await db_1.default.savedPost.delete({ where: { id: existingSave.id } });
            return { saved: false };
        }
        else {
            await db_1.default.savedPost.create({ data: { userId, postId } });
            return { saved: true };
        }
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
