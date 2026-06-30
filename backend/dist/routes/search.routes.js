"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("../controllers/search.controller");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', rateLimiter_1.apiLimiter, search_controller_1.searchController.search);
// AI search might be expensive, protect it heavily
router.post('/ai', auth_middleware_1.requireAuth, rateLimiter_1.apiLimiter, search_controller_1.searchController.aiSearch);
exports.default = router;
