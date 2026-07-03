import prisma from '../../src/utils/db';
import { generateUsers } from './factories/UserFactory';
import { generateCommunities } from './factories/CommunityFactory';
import { generateGrounds } from './factories/GroundFactory';
import { generateMatches } from './factories/MatchFactory';
import { generateSocials } from './factories/SocialFactory';
import { generateInteractions } from './factories/InteractionFactory';

export async function runSeed(scale: 'dev' | 'demo' | 'stress') {
  console.log(`[SEED] Starting ${scale} database seed...`);
  
  // Wipe database clean (respecting foreign key constraints)
  console.log('[SEED] Wiping existing data...');
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const counts = {
    dev: { users: 30, communities: 5, grounds: 5, matches: 20, posts: 30 },
    demo: { users: 400, communities: 40, grounds: 60, matches: 500, posts: 700 },
    stress: { users: 5000, communities: 100, grounds: 200, matches: 5000, posts: 10000 }
  };
  
  const c = counts[scale];

  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  try {
    console.log('[SEED] Generating and inserting Users...');
    const { users, profiles } = generateUsers(c.users);
    for (const chunk of chunkArray(users, 2000)) await prisma.user.createMany({ data: chunk });
    for (const chunk of chunkArray(profiles, 2000)) await prisma.profile.createMany({ data: chunk });

    console.log('[SEED] Generating and inserting Communities...');
    const { communities, communityMembers } = generateCommunities(c.communities, users);
    for (const chunk of chunkArray(communities, 2000)) await prisma.community.createMany({ data: chunk });
    for (const chunk of chunkArray(communityMembers, 2000)) await prisma.communityMember.createMany({ data: chunk });

    console.log('[SEED] Generating and inserting Grounds...');
    const { grounds, groundReviews } = generateGrounds(c.grounds, users);
    for (const chunk of chunkArray(grounds, 2000)) await prisma.ground.createMany({ data: chunk });
    for (const chunk of chunkArray(groundReviews, 2000)) await prisma.groundReview.createMany({ data: chunk });

    console.log('[SEED] Generating and inserting Matches...');
    const { matches, matchPlayers, matchComments } = generateMatches(c.matches, users, communities);
    for (const chunk of chunkArray(matches, 2000)) await prisma.match.createMany({ data: chunk });
    for (const chunk of chunkArray(matchPlayers, 2000)) await prisma.matchPlayer.createMany({ data: chunk });
    for (const chunk of chunkArray(matchComments, 2000)) await prisma.matchComment.createMany({ data: chunk });

    console.log('[SEED] Generating and inserting Socials...');
    const { posts, replies, postLikes } = generateSocials(c.posts, users, communities);
    for (const chunk of chunkArray(posts, 2000)) await prisma.post.createMany({ data: chunk });
    for (const chunk of chunkArray(replies, 2000)) await prisma.reply.createMany({ data: chunk });
    for (const chunk of chunkArray(postLikes, 2000)) await prisma.postLike.createMany({ data: chunk });

    console.log('[SEED] Generating and inserting Interactions...');
    const { messages, notifications, reports, reviews, connections } = generateInteractions(users, matches);
    for (const chunk of chunkArray(messages, 2000)) await prisma.message.createMany({ data: chunk });
    for (const chunk of chunkArray(notifications, 2000)) await prisma.notification.createMany({ data: chunk });
    for (const chunk of chunkArray(reports, 2000)) await prisma.report.createMany({ data: chunk });
    
    // Ignore unique constraint violations for reviews and connections by doing it one by one with upsert, or just use createMany and catch
    for (const chunk of chunkArray(reviews, 2000)) {
      try { await prisma.userReview.createMany({ data: chunk, skipDuplicates: true }); } catch (e) {}
    }
    for (const chunk of chunkArray(connections, 2000)) {
      try { await prisma.userConnection.createMany({ data: chunk, skipDuplicates: true }); } catch (e) {}
    }

    console.log('[SEED] Initializing default badges...');
    const { badgeService } = await import('../../src/services/badge.service');
    await badgeService.initializeBadges();

    console.log(`[SEED] Success! Seeded ${scale} data.`);
  } catch (err) {
    console.error('[SEED] Fatal Error during seeding:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
