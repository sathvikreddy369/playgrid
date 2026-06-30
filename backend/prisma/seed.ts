import { Role, MatchSkillLevel, MatchStatus, CommunityStatus, PostType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import prisma from '../src/utils/db';

async function main() {
  console.log('Clearing existing data...');
  // Clear data in reverse order of dependencies to avoid foreign key constraints errors
  await prisma.replyLike.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.post.deleteMany();
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.groundReview.deleteMany();
  await prisma.ground.deleteMany();
  await prisma.tournamentParticipant.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const users = [];
  const numberOfUsers = 25; 
  const hyderabadLocations = ['Gachibowli', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Hitech City', 'Kukatpally', 'Secunderabad', 'Begumpet', 'Miyapur'];

  for (let i = 0; i < numberOfUsers; i++) {
    const user = await prisma.user.create({
      data: {
        firebaseUid: faker.string.uuid(),
        email: faker.internet.email({ provider: 'gmail.com' }),
        name: faker.person.fullName(),
        role: i === 0 ? Role.ADMIN : Role.PLAYER,
        reputation: faker.number.int({ min: 50, max: 200 }),
        profile: {
          create: {
            bio: faker.person.bio(),
            avatarUrl: faker.image.avatar(),
            location: faker.helpers.arrayElement(hyderabadLocations),
            sports: faker.helpers.arrayElements(['Cricket', 'Football', 'Basketball', 'Badminton', 'Tennis'], { min: 1, max: 3 }),
          },
        },
      },
    });
    users.push(user);
  }

  console.log('Creating communities...');
  const communities = [];
  const numberOfCommunities = 5; 

  const communityNames = ['Hyderabad Strikers', 'Gachibowli FC', 'Deccan Hoopers', 'Madhapur Smashers', 'Cyberabad United'];

  for (let i = 0; i < numberOfCommunities; i++) {
    const owner = faker.helpers.arrayElement(users);
    const community = await prisma.community.create({
      data: {
        name: communityNames[i],
        description: `A community for sports enthusiasts in ${hyderabadLocations[i % hyderabadLocations.length]} and surrounding areas. Join us for regular games and tournaments!`,
        location: hyderabadLocations[i % hyderabadLocations.length],
        status: CommunityStatus.VERIFIED,
        ownerId: owner.id,
      },
    });
    communities.push(community);

    // Add random members to the community
    const memberCount = faker.number.int({ min: 3, max: 12 });
    const members = faker.helpers.arrayElements(users, memberCount);
    for (const member of members) {
      if (member.id !== owner.id) {
        // Prevent duplicate membership
        const existing = await prisma.communityMember.findUnique({ where: { userId_communityId: { userId: member.id, communityId: community.id } } });
        if (!existing) {
          await prisma.communityMember.create({
            data: {
              userId: member.id,
              communityId: community.id,
            },
          });
        }
      }
    }
  }

  console.log('Creating matches...');
  const matches = [];
  const matchTitles = ['Weekend Cricket', 'Evening Football', 'Morning Hoops', 'Casual Badminton', 'Sunday Tennis'];
  const sportsList = ['Cricket', 'Football', 'Basketball', 'Badminton', 'Tennis'];

  for (let i = 0; i < 30; i++) { 
    const creator = faker.helpers.arrayElement(users);
    const sport = faker.helpers.arrayElement(sportsList);
    const match = await prisma.match.create({
      data: {
        title: `${faker.helpers.arrayElement(['Weekend', 'Evening', 'Morning'])} ${sport} at ${faker.helpers.arrayElement(hyderabadLocations)}`,
        sport: sport,
        date: faker.date.soon({ days: 7 }),
        location: `${faker.helpers.arrayElement(hyderabadLocations)}, Hyderabad`,
        latitude: 17.3850 + faker.number.float({ min: -0.1, max: 0.1 }), // Approx Hyderabad lat
        longitude: 78.4867 + faker.number.float({ min: -0.1, max: 0.1 }), // Approx Hyderabad lng
        maxPlayers: sport === 'Cricket' ? 22 : sport === 'Football' ? 14 : sport === 'Basketball' ? 10 : 4,
        costPerPerson: faker.helpers.arrayElement([100, 150, 200, 250, 300, 500]),
        skillLevel: faker.helpers.arrayElement([MatchSkillLevel.ALL, MatchSkillLevel.BEGINNER, MatchSkillLevel.INTERMEDIATE, MatchSkillLevel.ADVANCED]),
        status: MatchStatus.OPEN,
        creatorId: creator.id,
        communityId: faker.datatype.boolean() ? faker.helpers.arrayElement(communities).id : null,
      },
    });
    matches.push(match);

    // Add players to match
    const playersCount = faker.number.int({ min: 0, max: 4 });
    const matchPlayers = faker.helpers.arrayElements(users, playersCount);
    for (const player of matchPlayers) {
      if (player.id !== creator.id) {
        const existing = await prisma.matchPlayer.findUnique({ where: { matchId_userId: { matchId: match.id, userId: player.id } } });
        if (!existing) {
          await prisma.matchPlayer.create({
            data: {
              userId: player.id,
              matchId: match.id,
              status: faker.helpers.arrayElement(['PENDING', 'APPROVED']),
            },
          });
        }
      }
    }
  }

  console.log('Creating posts...');
  const posts = [];
  for (let i = 0; i < 40; i++) { 
    const author = faker.helpers.arrayElement(users);
    const isCommunityPost = faker.datatype.boolean();
    
    const post = await prisma.post.create({
      data: {
        content: faker.helpers.arrayElement([
          `Anyone up for a game of Cricket this weekend in ${faker.helpers.arrayElement(hyderabadLocations)}?`,
          `Looking for a football team to join near ${faker.helpers.arrayElement(hyderabadLocations)}.`,
          `Great match today! The weather in Hyderabad was perfect for it.`,
          `Does anyone know good badminton courts in ${faker.helpers.arrayElement(hyderabadLocations)}?`,
          `Need 2 more players for our basketball match tomorrow evening.`
        ]),
        type: faker.helpers.arrayElement([PostType.GENERAL, PostType.LOOKING_FOR_PLAYERS, PostType.QUESTION]),
        location: `${faker.helpers.arrayElement(hyderabadLocations)}, Hyderabad`,
        latitude: 17.3850 + faker.number.float({ min: -0.1, max: 0.1 }),
        longitude: 78.4867 + faker.number.float({ min: -0.1, max: 0.1 }),
        authorId: author.id,
        communityId: isCommunityPost ? faker.helpers.arrayElement(communities).id : null,
        tags: faker.helpers.arrayElements(['football', 'cricket', 'hyderabad', 'weekend', 'help'], { min: 1, max: 3 }),
      },
    });
    posts.push(post);

    // Add random likes
    const likers = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 5 }));
    for (const liker of likers) {
      const existing = await prisma.postLike.findUnique({ where: { userId_postId: { userId: liker.id, postId: post.id } } });
      if (!existing) {
        await prisma.postLike.create({
          data: {
            userId: liker.id,
            postId: post.id,
          },
        });
      }
    }

    // Add random replies
    const replyCount = faker.number.int({ min: 0, max: 3 });
    for (let j = 0; j < replyCount; j++) {
      const replier = faker.helpers.arrayElement(users);
      await prisma.reply.create({
        data: {
          content: faker.helpers.arrayElement(['I am in!', 'Count me in.', 'Where exactly?', 'Check DM.', 'Great game!']),
          postId: post.id,
          authorId: replier.id,
        },
      });
    }
  }

  console.log('Creating reports...');
  // Create some fake reports so Admin dashboard isn't empty
  for (let i = 0; i < 15; i++) {
    const submitter = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(['POST', 'USER']);
    let targetId = '';
    
    if (type === 'POST') {
      targetId = faker.helpers.arrayElement(posts).id;
    } else {
      targetId = faker.helpers.arrayElement(users).id;
    }

    await prisma.report.create({
      data: {
        submitterId: submitter.id,
        targetType: type as any,
        targetId,
        reason: faker.helpers.arrayElement(['Inappropriate content', 'Spam', 'Harassment', 'Fake profile']),
        status: faker.helpers.arrayElement(['PENDING', 'PENDING', 'PENDING', 'REVIEWED', 'ACTION_TAKEN'])
      }
    });
  }

  console.log('Seed completed successfully!');
}

const run = async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
  await prisma.$disconnect();
};

run();
