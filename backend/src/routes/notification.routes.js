"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter);
router.get('/', notification_controller_1.notificationController.getNotifications);
router.put('/mark-all-read', notification_controller_1.notificationController.markAllAsRead);
router.put('/:id/read', notification_controller_1.notificationController.markAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map