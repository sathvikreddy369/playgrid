"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityService = exports.CommunityService = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
class CommunityService {
    async createCommunity(userId, data) {
        return db_1.default.community.create({
            data: {
                name: data.name,
                description: data.description,
                location: data.location,
                ownerId: userId,
                status: client_1.CommunityStatus.PENDING,
                members: {
                    create: [{ userId }] // Automatically make creator a member
                }
            },
        });
    }
    async getCommunities(status) {
        return db_1.default.community.findMany({
            where: status ? { status } : { status: client_1.CommunityStatus.VERIFIED },
            include: {
                owner: { select: { id: true, name: true } },
                _count: { select: { members: true, matches: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getCommunityById(id) {
        return db_1.default.community.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, role: true, profile: { select: { avatarUrl: true } } } }
                    }
                },
                _count: { select: { members: true, matches: true } }
            }
        });
    }
    async joinCommunity(communityId, userId) {
        const community = await db_1.default.community.findUnique({ where: { id: communityId } });
        if (!community)
            throw new Error('Community not found');
        const existing = await db_1.default.communityMember.findUnique({
            where: { userId_communityId: { userId, communityId } }
        });
        if (existing)
            throw new Error('Already a member');
        return db_1.default.communityMember.create({
            data: { userId, communityId }
        });
    }
    async leaveCommunity(communityId, userId) {
        const existing = await db_1.default.communityMember.findUnique({
            where: { userId_communityId: { userId, communityId } }
        });
        if (!existing)
            throw new Error('Not a member');
        return db_1.default.communityMember.delete({
            where: { id: existing.id }
        });
    }
    async kickMember(communityId, memberUserId, requesterId, requesterRole) {
        const community = await db_1.default.community.findUnique({ where: { id: communityId } });
        if (!community)
            throw new Error('Community not found');
        // Only owner or platform admin can kick
        if (community.ownerId !== requesterId && requesterRole !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        if (community.ownerId === memberUserId) {
            throw new Error('Cannot kick the owner');
        }
        const member = await db_1.default.communityMember.findUnique({
            where: { userId_communityId: { userId: memberUserId, communityId } }
        });
        if (!member)
            throw new Error('User is not a member');
        return db_1.default.communityMember.delete({ where: { id: member.id } });
    }
    async verifyCommunity(communityId, status, adminId, adminRole) {
        if (adminRole !== 'ADMIN')
            throw new Error('Unauthorized');
        return db_1.default.community.update({
            where: { id: communityId },
            data: { status }
        });
    }
}
exports.CommunityService = CommunityService;
exports.communityService = new CommunityService();
