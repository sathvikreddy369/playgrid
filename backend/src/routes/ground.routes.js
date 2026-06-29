"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ground_controller_1 = require("../controllers/ground.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Public discovery
router.get('/', rateLimiter_1.apiLimiter, ground_controller_1.groundController.getGrounds);
router.get('/:id', rateLimiter_1.apiLimiter, ground_controller_1.groundController.getGroundById);
// Protected Ground Owner Actions
router.post('/', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, ground_controller_1.groundController.createGround);
router.put('/:id', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, ground_controller_1.groundController.updateGround);
// Reviews
router.post('/:id/reviews', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, ground_controller_1.groundController.addReview);
router.delete('/:id/reviews/:reviewId', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, ground_controller_1.groundController.deleteReview);
exports.default = router;
//# sourceMappingURL=ground.routes.js.map