import prisma from '../utils/db';

export class BadgeService {
  // Pre-defined badge templates
  private readonly BADGES = [
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
      await prisma.badge.upsert({
        where: { name: b.name },
        update: {},
        create: { name: b.name, description: b.description, icon: b.icon }
      });
    }
  }

  async awardBadge(userId: string, badgeName: string) {
    const badgeTemplate = this.BADGES.find(b => b.name === badgeName);
    if (!badgeTemplate) return;

    // Lazily create badge if missing
    const badge = await prisma.badge.upsert({
      where: { name: badgeTemplate.name },
      update: {},
      create: { name: badgeTemplate.name, description: badgeTemplate.description, icon: badgeTemplate.icon }
    });

    // Check if user already has it
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } }
    });

    if (!existing) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id }
      });
      
      // Optionally create a notification here
      await prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_ALERT',
          content: `You've earned a new badge: ${badge.icon} ${badge.description}!`,
        }
      });
    }
  }

  async evaluateUserMatches(userId: string) {
    const attendedCount = await prisma.matchPlayer.count({
      where: { userId, status: 'ATTENDED' }
    });

    if (attendedCount >= 5) await this.awardBadge(userId, 'MATCH_5');
    if (attendedCount >= 10) await this.awardBadge(userId, 'MATCH_10');
    if (attendedCount >= 25) await this.awardBadge(userId, 'MATCH_25');
    if (attendedCount >= 50) await this.awardBadge(userId, 'MATCH_50');
    if (attendedCount >= 100) await this.awardBadge(userId, 'MATCH_100');
    if (attendedCount >= 250) await this.awardBadge(userId, 'MATCH_250');
  }

  async evaluateCommunityCreator(userId: string) {
    const communities = await prisma.community.count({
      where: { ownerId: userId, status: 'VERIFIED' }
    });
    if (communities > 0) {
      await this.awardBadge(userId, 'COMMUNITY_CREATOR');
    }
  }

  async evaluateVenueOwner(userId: string) {
    const grounds = await prisma.ground.count({
      where: { ownerId: userId, status: 'VERIFIED' }
    });
    if (grounds > 0) {
      await this.awardBadge(userId, 'VENUE_OWNER');
    }
  }
}

export const badgeService = new BadgeService();
