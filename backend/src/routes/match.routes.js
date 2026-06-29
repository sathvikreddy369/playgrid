"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("../controllers/match.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Public discovery
router.get('/', rateLimiter_1.apiLimiter, match_controller_1.matchController.getMatches);
router.get('/:id', rateLimiter_1.apiLimiter, match_controller_1.matchController.getMatchById);
// Protected actions
router.get('/recommendations', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.getRecommendations);
router.post('/', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.createMatch);
router.post('/:id/join', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.requestToJoin);
router.put('/:id/cancel', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.cancelMatch);
// Organizer actions
router.put('/:id/players/:userId/approve', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.approvePlayer);
router.put('/:id/players/:userId/reject', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.rejectPlayer);
router.post('/:id/players/:userId/attend', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, match_controller_1.matchController.markAttendance);
exports.default = router;
//# sourceMappingURL=match.routes.js.map