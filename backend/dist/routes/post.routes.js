"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Publicly readable or require auth? Let's say feed is public but actions require auth.
// Actually, let's allow optionally authenticated reads to get "liked" status.
// We can use a loose auth middleware for GET, but for now we'll just use standard requireAuth since it's a social app.
// Or we can just let `req.user` be populated if token exists in a custom middleware.
// For simplicity, let's requireAuth for everything right now, or just make GET public and check req headers if we want.
// Let's assume you must be logged in to see the feed for now.
router.get('/', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.getPosts);
router.get('/:id', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.getPostById);
// Write actions require strict rate limiting
router.post('/', auth_middleware_1.requireAuth, rateLimiter_1.postLimiter, post_controller_1.postController.createPost);
router.put('/:id', auth_middleware_1.requireAuth, rateLimiter_1.postLimiter, post_controller_1.postController.updatePost);
router.delete('/:id', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.deletePost);
router.post('/:id/like', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.toggleLike);
router.post('/:id/save', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.toggleSave);
// Replies
router.post('/:id/replies', auth_middleware_1.requireAuth, rateLimiter_1.postLimiter, post_controller_1.postController.createReply);
router.post('/replies/:id/like', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.toggleReplyLike);
router.delete('/replies/:id', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.deleteReply);
exports.default = router;
//# sourceMappingURL=post.routes.js.map