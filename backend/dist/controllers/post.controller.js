"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = exports.PostController = void 0;
const post_service_1 = require("../services/post.service");
const reply_service_1 = require("../services/reply.service");
class PostController {
    async getPosts(req, res) {
        try {
            const { type, communityId, authorId, cursor, limit } = req.query;
            const result = await post_service_1.postService.getPosts({
                type: type,
                communityId: communityId,
                authorId: authorId
            }, cursor, limit ? parseInt(limit) : 10);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getPostById(req, res) {
        try {
            const userId = req.user?.id;
            const post = await post_service_1.postService.getPostById(req.params.id, userId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async createPost(req, res) {
        try {
            const userId = req.user.id;
            const post = await post_service_1.postService.createPost(userId, req.body);
            res.status(201).json(post);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updatePost(req, res) {
        try {
            const userId = req.user.id;
            const { content } = req.body;
            const post = await post_service_1.postService.updatePost(req.params.id, userId, content);
            res.json(post);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deletePost(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            await post_service_1.postService.deletePost(req.params.id, userId, role);
            res.json({ message: 'Post deleted' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async toggleLike(req, res) {
        try {
            const userId = req.user.id;
            const result = await post_service_1.postService.toggleLike(req.params.id, userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async toggleSave(req, res) {
        try {
            const userId = req.user.id;
            const result = await post_service_1.postService.toggleSave(req.params.id, userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // --- REPLIES ---
    async createReply(req, res) {
        try {
            const userId = req.user.id;
            const { content, parentId } = req.body;
            const reply = await reply_service_1.replyService.createReply(userId, req.params.id, content, parentId);
            res.status(201).json(reply);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async toggleReplyLike(req, res) {
        try {
            const userId = req.user.id;
            const result = await reply_service_1.replyService.toggleLike(req.params.id, userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteReply(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            await reply_service_1.replyService.deleteReply(req.params.id, userId, role);
            res.json({ message: 'Reply deleted' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.PostController = PostController;
exports.postController = new PostController();
//# sourceMappingURL=post.controller.js.map