"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchController = exports.MatchController = void 0;
const match_service_1 = require("../services/match.service");
const ai_service_1 = require("../services/ai.service");
const db_1 = __importDefault(require("../utils/db"));
class MatchController {
    async getRecommendations(req, res) {
        try {
            const userId = req.user.id;
            const user = await db_1.default.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });
            if (!user?.profile)
                return res.json([]);
            // Fetch upcoming open matches
            const matches = await db_1.default.match.findMany({
                where: { status: 'OPEN', date: { gte: new Date() } },
                include: { creator: { select: { name: true } }, _count: { select: { players: true } } },
                take: 20
            });
            const recommendations = await ai_service_1.aiService.getRecommendations(user.profile, matches);
            res.json(recommendations);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async createMatch(req, res) {
        try {
            const userId = req.user.id;
            const match = await match_service_1.matchService.createMatch(userId, req.body);
            res.status(201).json(match);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getMatches(req, res) {
        try {
            const matches = await match_service_1.matchService.getMatches(req.query);
            res.json(matches);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getMatchById(req, res) {
        try {
            const match = await match_service_1.matchService.getMatchById(req.params.id);
            if (!match)
                return res.status(404).json({ error: 'Match not found' });
            res.json(match);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async requestToJoin(req, res) {
        try {
            const userId = req.user.id;
            const player = await match_service_1.matchService.requestToJoin(req.params.id, userId);
            res.status(201).json(player);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async approvePlayer(req, res) {
        try {
            const creatorId = req.user.id;
            const result = await match_service_1.matchService.handleJoinRequest(req.params.id, creatorId, req.params.userId, 'APPROVED');
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async rejectPlayer(req, res) {
        try {
            const creatorId = req.user.id;
            const result = await match_service_1.matchService.handleJoinRequest(req.params.id, creatorId, req.params.userId, 'REJECTED');
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async markAttendance(req, res) {
        try {
            const creatorId = req.user.id;
            const { rating } = req.body;
            const result = await match_service_1.matchService.markAttendance(req.params.id, creatorId, req.params.userId, rating);
            // Evaluate badges after attendance
            const { badgeService } = await Promise.resolve().then(() => __importStar(require('../services/badge.service')));
            await badgeService.evaluateUserMatches(req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async cancelMatch(req, res) {
        try {
            const creatorId = req.user.id;
            const result = await match_service_1.matchService.cancelMatch(req.params.id, creatorId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async addComment(req, res) {
        try {
            const userId = req.user.id;
            const { content } = req.body;
            const comment = await match_service_1.matchService.addComment(req.params.id, userId, content);
            res.status(201).json(comment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.MatchController = MatchController;
exports.matchController = new MatchController();
