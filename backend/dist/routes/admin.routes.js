"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const community_controller_1 = require("../controllers/community.controller");
const ground_controller_1 = require("../controllers/ground.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Only ADMIN can access these routes
router.use(auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['ADMIN']));
// Dashboard Data
router.get('/stats', admin_controller_1.adminController.getStats);
router.get('/queue', admin_controller_1.adminController.getModerationQueue);
router.get('/users', admin_controller_1.adminController.getUsers);
router.get('/matches', admin_controller_1.adminController.getMatches);
// Community Verification
router.put('/communities/:id/verify', community_controller_1.communityController.verifyCommunity);
// Ground Verification
router.put('/grounds/:id/verify', ground_controller_1.groundController.verifyGround);
// Moderation & Reports
router.get('/reports', admin_controller_1.adminController.getReports);
router.put('/reports/:id/resolve', admin_controller_1.adminController.resolveReport);
router.put('/users/:id/block', admin_controller_1.adminController.toggleBlockUser);
router.delete('/posts/:id', admin_controller_1.adminController.deletePost);
exports.default = router;
