"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const db_1 = __importDefault(require("../utils/db"));
class AdminService {
    async getStats() {
        const totalUsers = await db_1.default.user.count();
        const totalMatches = await db_1.default.match.count();
        const totalCommunities = await db_1.default.community.count();
        const totalGrounds = await db_1.default.ground.count();
        const activeMatches = await db_1.default.match.count({ where: { status: 'OPEN' } });
        const pendingGrounds = await db_1.default.ground.count({ where: { status: 'PENDING' } });
        const pendingCommunities = await db_1.default.community.count({ where: { status: 'PENDING' } });
        return {
            totalUsers,
            totalMatches,
            totalCommunities,
            totalGrounds,
            activeMatches,
            pendingGrounds,
            pendingCommunities
        };
    }
    async getModerationQueue() {
        const pendingCommunities = await db_1.default.community.findMany({
            where: { status: 'PENDING' },
            include: { owner: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'asc' }
        });
        const pendingGrounds = await db_1.default.ground.findMany({
            where: { status: 'PENDING' },
            include: { owner: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'asc' }
        });
        return {
            pendingCommunities,
            pendingGrounds
        };
    }
    async getUsers() {
        return db_1.default.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100, // MVP limit
            include: {
                _count: { select: { posts: true, matchesCreated: true } }
            }
        });
    }
    async getMatches() {
        return db_1.default.match.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                creator: { select: { name: true } },
                _count: { select: { players: true } }
            }
        });
    }
    async getReports() {
        // Fetch pending reports
        return db_1.default.report.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            include: {
                submitter: { select: { name: true, email: true } }
            }
        });
    }
    async resolveReport(id, action) {
        return db_1.default.report.update({
            where: { id },
            data: { status: action }
        });
    }
    async toggleBlockUser(id) {
        const user = await db_1.default.user.findUnique({ where: { id } });
        if (!user)
            throw new Error('User not found');
        return db_1.default.user.update({
            where: { id },
            data: { isBlocked: !user.isBlocked }
        });
    }
    async deletePost(id) {
        return db_1.default.post.delete({
            where: { id }
        });
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
