"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityController = exports.CommunityController = void 0;
const community_service_1 = require("../services/community.service");
class CommunityController {
    async createCommunity(req, res) {
        try {
            const userId = req.user.id;
            // Per instructions, any user can apply for a community/organizer role.
            // So we allow any logged-in user to create a community (which starts PENDING).
            const community = await community_service_1.communityService.createCommunity(userId, req.body);
            res.status(201).json(community);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCommunities(req, res) {
        try {
            const status = req.query.status;
            const communities = await community_service_1.communityService.getCommunities(status);
            res.json(communities);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getCommunityById(req, res) {
        try {
            const community = await community_service_1.communityService.getCommunityById(req.params.id);
            if (!community) {
                return res.status(404).json({ error: 'Community not found' });
            }
            res.json(community);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async joinCommunity(req, res) {
        try {
            const userId = req.user.id;
            const member = await community_service_1.communityService.joinCommunity(req.params.id, userId);
            res.json(member);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async leaveCommunity(req, res) {
        try {
            const userId = req.user.id;
            await community_service_1.communityService.leaveCommunity(req.params.id, userId);
            res.json({ message: 'Left community' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async kickMember(req, res) {
        try {
            const requesterId = req.user.id;
            const requesterRole = req.user.role;
            const { id, userId } = req.params;
            await community_service_1.communityService.kickMember(id, userId, requesterId, requesterRole);
            res.json({ message: 'Member removed' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async verifyCommunity(req, res) {
        try {
            const adminId = req.user.id;
            const adminRole = req.user.role;
            const { status } = req.body;
            const community = await community_service_1.communityService.verifyCommunity(req.params.id, status, adminId, adminRole);
            res.json(community);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CommunityController = CommunityController;
exports.communityController = new CommunityController();
//# sourceMappingURL=community.controller.js.map