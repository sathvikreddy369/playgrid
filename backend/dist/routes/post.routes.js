"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Feed should be public, but optionally loaded with user
router.get('/', auth_middleware_1.optionalAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.getPosts);
router.get('/:id', auth_middleware_1.optionalAuth, rateLimiter_1.apiLimiter, post_controller_1.postController.getPostById);
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
