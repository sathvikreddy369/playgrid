"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchService = exports.MatchService = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
const notification_service_1 = require("./notification.service");
const ai_service_1 = require("./ai.service");
class MatchService {
    async createMatch(userId, data) {
        const cost = data.costPerPerson ? parseFloat(data.costPerPerson) : 0;
        // AI Fake Event Check
        const aiCheck = await ai_service_1.aiService.detectFakeEvent(data.title, data.sport, cost);
        if (aiCheck.isFake) {
            throw new Error(`Match creation blocked by AI: ${aiCheck.reason}`);
        }
        return db_1.default.match.create({
            data: {
                title: data.title,
                sport: data.sport,
                date: new Date(data.date),
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                maxPlayers: parseInt(data.maxPlayers),
                costPerPerson: data.costPerPerson ? parseFloat(data.costPerPerson) : null,
                skillLevel: data.skillLevel || 'ALL',
                creatorId: userId,
                communityId: data.communityId || null,
                status: client_1.MatchStatus.OPEN,
            },
        });
    }
    async getMatches(filters) {
        const where = {};
        if (filters.sport)
            where.sport = filters.sport;
        if (filters.status)
            where.status = filters.status;
        if (filters.communityId)
            where.communityId = filters.communityId;
        return db_1.default.match.findMany({
            where,
            include: {
                creator: { select: { id: true, name: true } },
                community: { select: { id: true, name: true } },
                _count: { select: { players: { where: { status: 'APPROVED' } } } }
            },
            orderBy: { date: 'asc' }
        });
    }
    async getMatchById(id) {
        return db_1.default.match.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                community: { select: { id: true, name: true } },
                players: {
                    include: {
                        user: { select: { id: true, name: true, reputation: true, profile: { select: { avatarUrl: true } } } }
                    }
                }
            }
        });
    }
    async requestToJoin(matchId, userId) {
        const match = await db_1.default.match.findUnique({ where: { id: matchId } });
        if (!match)
            throw new Error('Match not found');
        if (match.status !== 'OPEN')
            throw new Error('Match is not open');
        const existing = await db_1.default.matchPlayer.findUnique({
            where: { matchId_userId: { matchId, userId } }
        });
        if (existing)
            throw new Error('Already requested to join');
        const player = await db_1.default.matchPlayer.create({
            data: { matchId, userId, status: 'PENDING' }
        });
        // Notify creator
        await notification_service_1.notificationService.createNotification({
            userId: match.creatorId,
            type: 'JOIN_REQUEST',
            content: `A new player wants to join your match: ${match.title}`,
            link: `/matches/${matchId}`
        });
        return player;
    }
    async handleJoinRequest(matchId, creatorId, targetUserId, action) {
        const match = await db_1.default.match.findUnique({ where: { id: matchId } });
        if (!match || match.creatorId !== creatorId)
            throw new Error('Unauthorized');
        const updated = await db_1.default.matchPlayer.update({
            where: { matchId_userId: { matchId, userId: targetUserId } },
            data: { status: action }
        });
        // Notify user
        await notification_service_1.notificationService.createNotification({
            userId: targetUserId,
            type: action === 'APPROVED' ? 'JOIN_APPROVED' : 'JOIN_REJECTED',
            content: `Your request to join ${match.title} was ${action.toLowerCase()}.`,
            link: `/matches/${matchId}`
        });
        // If approved, check if full
        if (action === 'APPROVED') {
            const approvedCount = await db_1.default.matchPlayer.count({ where: { matchId, status: 'APPROVED' } });
            if (approvedCount >= match.maxPlayers) {
                await db_1.default.match.update({ where: { id: matchId }, data: { status: 'FULL' } });
            }
        }
        return updated;
    }
    async markAttendance(matchId, creatorId, targetUserId, performanceRating) {
        const match = await db_1.default.match.findUnique({ where: { id: matchId } });
        if (!match || match.creatorId !== creatorId)
            throw new Error('Unauthorized');
        if (performanceRating < 1 || performanceRating > 5)
            throw new Error('Rating must be 1-5');
        const player = await db_1.default.matchPlayer.update({
            where: { matchId_userId: { matchId, userId: targetUserId } },
            data: { status: 'ATTENDED', performanceRating }
        });
        // Boost reputation (e.g. base +5 for attending, plus rating bonus)
        const reputationBoost = 5 + (performanceRating * 2); // max 15 points
        await db_1.default.user.update({
            where: { id: targetUserId },
            data: { reputation: { increment: reputationBoost } }
        });
        return player;
    }
    async cancelMatch(matchId, creatorId) {
        const match = await db_1.default.match.findUnique({
            where: { id: matchId },
            include: { players: { where: { status: 'APPROVED' } } }
        });
        if (!match || match.creatorId !== creatorId)
            throw new Error('Unauthorized');
        const updated = await db_1.default.match.update({
            where: { id: matchId },
            data: { status: 'CANCELLED' }
        });
        // Notify all approved players
        for (const p of match.players) {
            await notification_service_1.notificationService.createNotification({
                userId: p.userId,
                type: 'SYSTEM_ALERT',
                content: `Match cancelled: ${match.title}`,
                link: `/matches/${matchId}`
            });
        }
        return updated;
    }
}
exports.MatchService = MatchService;
exports.matchService = new MatchService();
//# sourceMappingURL=match.service.js.map