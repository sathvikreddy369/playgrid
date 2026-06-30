"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeService = exports.BadgeService = void 0;
const db_1 = __importDefault(require("../utils/db"));
class BadgeService {
    // Pre-defined badge templates
    BADGES = [
        { name: 'COMMUNITY_CREATOR', description: 'Created an approved community', icon: '🏆' },
        { name: 'MATCH_5', description: 'Played 5 matches', icon: '🥉' },
        { name: 'MATCH_10', description: 'Played 10 matches', icon: '🥈' },
        { name: 'MATCH_25', description: 'Played 25 matches', icon: '🥇' },
        { name: 'MATCH_50', description: 'Played 50 matches', icon: '⭐' },
        { name: 'MATCH_100', description: 'Played 100 matches', icon: '🌟' },
        { name: 'MATCH_250', description: 'Played 250 matches', icon: '👑' },
        { name: 'VENUE_OWNER', description: 'Owns a verified venue', icon: '🏟️' }
    ];
    async initializeBadges() {
        for (const b of this.BADGES) {
            await db_1.default.badge.upsert({
                where: { name: b.name },
                update: {},
                create: { name: b.name, description: b.description, icon: b.icon }
            });
        }
    }
    async awardBadge(userId, badgeName) {
        const badgeTemplate = this.BADGES.find(b => b.name === badgeName);
        if (!badgeTemplate)
            return;
        // Lazily create badge if missing
        const badge = await db_1.default.badge.upsert({
            where: { name: badgeTemplate.name },
            update: {},
            create: { name: badgeTemplate.name, description: badgeTemplate.description, icon: badgeTemplate.icon }
        });
        // Check if user already has it
        const existing = await db_1.default.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } }
        });
        if (!existing) {
            await db_1.default.userBadge.create({
                data: { userId, badgeId: badge.id }
            });
            // Optionally create a notification here
            await db_1.default.notification.create({
                data: {
                    userId,
                    type: 'SYSTEM_ALERT',
                    content: `You've earned a new badge: ${badge.icon} ${badge.description}!`,
                }
            });
        }
    }
    async evaluateUserMatches(userId) {
        const attendedCount = await db_1.default.matchPlayer.count({
            where: { userId, status: 'ATTENDED' }
        });
        if (attendedCount >= 5)
            await this.awardBadge(userId, 'MATCH_5');
        if (attendedCount >= 10)
            await this.awardBadge(userId, 'MATCH_10');
        if (attendedCount >= 25)
            await this.awardBadge(userId, 'MATCH_25');
        if (attendedCount >= 50)
            await this.awardBadge(userId, 'MATCH_50');
        if (attendedCount >= 100)
            await this.awardBadge(userId, 'MATCH_100');
        if (attendedCount >= 250)
            await this.awardBadge(userId, 'MATCH_250');
    }
    async evaluateCommunityCreator(userId) {
        const communities = await db_1.default.community.count({
            where: { ownerId: userId, status: 'VERIFIED' }
        });
        if (communities > 0) {
            await this.awardBadge(userId, 'COMMUNITY_CREATOR');
        }
    }
    async evaluateVenueOwner(userId) {
        const grounds = await db_1.default.ground.count({
            where: { ownerId: userId, status: 'VERIFIED' }
        });
        if (grounds > 0) {
            await this.awardBadge(userId, 'VENUE_OWNER');
        }
    }
}
exports.BadgeService = BadgeService;
exports.badgeService = new BadgeService();
