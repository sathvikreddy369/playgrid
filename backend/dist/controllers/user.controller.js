"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const db_1 = __importDefault(require("../utils/db"));
class UserController {
    async getUserProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await db_1.default.user.findUnique({
                where: { id: id },
                include: {
                    profile: true,
                    badges: { include: { badge: true } },
                }
            });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getUserPosts(req, res) {
        try {
            const { id } = req.params;
            const posts = await db_1.default.post.findMany({
                where: { authorId: id },
                include: {
                    author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                    community: { select: { id: true, name: true } },
                    _count: { select: { likes: true, replies: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(posts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getUserLikes(req, res) {
        try {
            const { id } = req.params;
            const likes = await db_1.default.postLike.findMany({
                where: { userId: id },
                include: {
                    post: {
                        include: {
                            author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                            community: { select: { id: true, name: true } },
                            _count: { select: { likes: true, replies: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(likes.map(like => like.post));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getUserReplies(req, res) {
        try {
            const { id } = req.params;
            const replies = await db_1.default.reply.findMany({
                where: { authorId: id },
                include: {
                    post: { select: { id: true, content: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(replies);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getUserMatches(req, res) {
        try {
            const { id } = req.params;
            const matches = await db_1.default.match.findMany({
                where: {
                    OR: [
                        { creatorId: id },
                        { players: { some: { userId: id } } }
                    ]
                },
                orderBy: { date: 'desc' },
                include: {
                    creator: { select: { id: true, name: true } },
                    _count: { select: { players: true } }
                }
            });
            res.json(matches);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
