"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protected sync route: Requires valid Firebase JWT
router.post('/sync', auth_middleware_1.requireAuth, auth_controller_1.AuthController.sync);
// Protected me route: Fetch user profile
router.get('/me', auth_middleware_1.requireAuth, auth_controller_1.AuthController.me);
router.put('/profile', auth_middleware_1.requireAuth, auth_controller_1.AuthController.updateProfile);
// Upgrade to Organizer
router.post('/upgrade-organizer', auth_middleware_1.requireAuth, auth_controller_1.AuthController.upgradeToOrganizer);
// Upgrade to Admin (for local testing)
router.post('/make-me-admin', auth_middleware_1.requireAuth, auth_controller_1.AuthController.makeMeAdmin);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map