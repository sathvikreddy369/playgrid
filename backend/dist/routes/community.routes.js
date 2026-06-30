"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const community_controller_1 = require("../controllers/community.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Publicly accessible discovery (or authenticated if we prefer)
router.get('/', rateLimiter_1.apiLimiter, community_controller_1.communityController.getCommunities);
router.get('/:id', rateLimiter_1.apiLimiter, community_controller_1.communityController.getCommunityById);
// Protected Actions
router.post('/', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, community_controller_1.communityController.createCommunity);
router.post('/:id/join', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, community_controller_1.communityController.joinCommunity);
router.delete('/:id/leave', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, community_controller_1.communityController.leaveCommunity);
// Moderation
router.delete('/:id/members/:userId', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, community_controller_1.communityController.kickMember);
exports.default = router;
