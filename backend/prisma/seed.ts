import { PrismaClient, Role, MatchStatus, MatchSkillLevel, CommunityStatus, GroundStatus, PostType } from '@prisma/client';
import { fakerEN_IN as faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball'];
const LOCATIONS = [
  'Koramangala, Bangalore',
  'HSR Layout, Bangalore',
  'Indiranagar, Bangalore',
  'Whitefield, Bangalore',
  'Jayanagar, Bangalore',
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean existing data (Optional, be careful in prod. We use cascade deletes mostly but explicit is safer for seed)
  await prisma.reply.deleteMany();
  await prisma.post.deleteMany();
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.ground.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin
  const admin = await prisma.user.create({
    data: {
      firebaseUid: 'admin-mock-uid-12345',
      email: 'admin@playgrid.in',
      name: 'Playgrid Admin',
      role: Role.ADMIN,
      profile: {
        create: {
          bio: 'Platform Administrator',
          location: 'Bangalore',
          sports: ['Cricket'],
        },
      },
    },
  });

  // 3. Create Users (Players & Organizers)
  const users = [];
  for (let i = 0; i < 20; i++) {
    const isOrganizer = i < 3; // First 3 are organizers
    const name = faker.person.fullName();
    const user = await prisma.user.create({
      data: {
        firebaseUid: faker.string.uuid(),
        email: faker.internet.email({ firstName: name }),
        name: name,
        role: isOrganizer ? Role.ORGANIZER : Role.PLAYER,
        reputation: faker.number.int({ min: 80, max: 100 }),
        profile: {
          create: {
            bio: faker.person.bio(),
            location: faker.helpers.arrayElement(LOCATIONS),
            sports: faker.helpers.arrayElements(SPORTS, { min: 1, max: 3 }),
            avatarUrl: faker.image.avatar(),
          },
        },
      },
    });
    users.push(user);
  }

  const organizers = users.filter((u) => u.role === Role.ORGANIZER);
  const players = users.filter((u) => u.role === Role.PLAYER);

  // 4. Create Grounds
  const grounds = [];
  for (let i = 0; i < 5; i++) {
    const owner = faker.helpers.arrayElement(organizers);
    const ground = await prisma.ground.create({
      data: {
        name: `${faker.company.name()} Sports Arena`,
        location: faker.helpers.arrayElement(LOCATIONS),
        latitude: faker.location.latitude({ min: 12.8, max: 13.1 }), // Bangalore approx
        longitude: faker.location.longitude({ min: 77.5, max: 77.8 }),
        pricing: '₹1200/hr',
        amenities: ['Parking', 'Washroom', 'Drinking Water', 'Floodlights'],
        sports: faker.helpers.arrayElements(SPORTS, { min: 1, max: 2 }),
        status: GroundStatus.VERIFIED,
        ownerId: owner.id,
      },
    });
    grounds.push(ground);
  }

  // 5. Create Communities
  const communities = [];
  for (let i = 0; i < 5; i++) {
    const owner = faker.helpers.arrayElement(players);
    const community = await prisma.community.create({
      data: {
        name: `${faker.helpers.arrayElement(LOCATIONS).split(',')[0]} ${faker.helpers.arrayElement(SPORTS)} Club`,
        description: faker.lorem.paragraph(),
        location: faker.helpers.arrayElement(LOCATIONS),
        status: CommunityStatus.VERIFIED,
        ownerId: owner.id,
        members: {
          create: faker.helpers.arrayElements(players, 5).map((p) => ({
            userId: p.id,
          })),
        },
      },
    });
    communities.push(community);
  }

  // 6. Create Matches
  for (let i = 0; i < 15; i++) {
    const creator = faker.helpers.arrayElement(players);
    const sport = faker.helpers.arrayElement(SPORTS);
    const date = faker.date.soon({ days: 10 });
    const maxPlayers = faker.number.int({ min: 4, max: 14 });
    
    await prisma.match.create({
      data: {
        title: `Weekend ${sport} Match`,
        sport: sport,
        date: date,
        location: faker.helpers.arrayElement(LOCATIONS),
        latitude: faker.location.latitude({ min: 12.8, max: 13.1 }),
        longitude: faker.location.longitude({ min: 77.5, max: 77.8 }),
        maxPlayers: maxPlayers,
        costPerPerson: faker.number.int({ min: 100, max: 300 }),
        skillLevel: faker.helpers.arrayElement([MatchSkillLevel.BEGINNER, MatchSkillLevel.INTERMEDIATE, MatchSkillLevel.ALL]),
        status: MatchStatus.OPEN,
        creatorId: creator.id,
        players: {
          create: faker.helpers.arrayElements(players, { min: 1, max: maxPlayers - 1 }).map((p) => ({
            userId: p.id,
            status: 'APPROVED',
          })),
        },
      },
    });
  }

  // 7. Create Feed Posts
  for (let i = 0; i < 30; i++) {
    const author = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement([PostType.GENERAL, PostType.LOOKING_FOR_PLAYERS, PostType.QUESTION]);
    
    await prisma.post.create({
      data: {
        content: faker.lorem.sentences(2),
        type: type,
        location: faker.helpers.arrayElement(LOCATIONS),
        authorId: author.id,
        tags: [faker.helpers.arrayElement(SPORTS).toLowerCase()],
        replies: {
          create: faker.helpers.arrayElements(users, { min: 0, max: 3 }).map((u) => ({
            content: faker.lorem.sentence(),
            authorId: u.id,
          })),
        }
      },
    });
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
