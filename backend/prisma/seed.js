"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
            role: client_1.Role.ADMIN,
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
        const name = faker_1.fakerEN_IN.person.fullName();
        const user = await prisma.user.create({
            data: {
                firebaseUid: faker_1.fakerEN_IN.string.uuid(),
                email: faker_1.fakerEN_IN.internet.email({ firstName: name }),
                name: name,
                role: isOrganizer ? client_1.Role.ORGANIZER : client_1.Role.PLAYER,
                reputation: faker_1.fakerEN_IN.number.int({ min: 80, max: 100 }),
                profile: {
                    create: {
                        bio: faker_1.fakerEN_IN.person.bio(),
                        location: faker_1.fakerEN_IN.helpers.arrayElement(LOCATIONS),
                        sports: faker_1.fakerEN_IN.helpers.arrayElements(SPORTS, { min: 1, max: 3 }),
                        avatarUrl: faker_1.fakerEN_IN.image.avatar(),
                    },
                },
            },
        });
        users.push(user);
    }
    const organizers = users.filter((u) => u.role === client_1.Role.ORGANIZER);
    const players = users.filter((u) => u.role === client_1.Role.PLAYER);
    // 4. Create Grounds
    const grounds = [];
    for (let i = 0; i < 5; i++) {
        const owner = faker_1.fakerEN_IN.helpers.arrayElement(organizers);
        const ground = await prisma.ground.create({
            data: {
                name: `${faker_1.fakerEN_IN.company.name()} Sports Arena`,
                location: faker_1.fakerEN_IN.helpers.arrayElement(LOCATIONS),
                latitude: faker_1.fakerEN_IN.location.latitude({ min: 12.8, max: 13.1 }), // Bangalore approx
                longitude: faker_1.fakerEN_IN.location.longitude({ min: 77.5, max: 77.8 }),
                pricing: '₹1200/hr',
                amenities: ['Parking', 'Washroom', 'Drinking Water', 'Floodlights'],
                sports: faker_1.fakerEN_IN.helpers.arrayElements(SPORTS, { min: 1, max: 2 }),
                status: client_1.GroundStatus.VERIFIED,
                ownerId: owner.id,
            },
        });
        grounds.push(ground);
    }
    // 5. Create Communities
    const communities = [];
    for (let i = 0; i < 5; i++) {
        const owner = faker_1.fakerEN_IN.helpers.arrayElement(players);
        const community = await prisma.community.create({
            data: {
                name: `${faker_1.fakerEN_IN.helpers.arrayElement(LOCATIONS).split(',')[0]} ${faker_1.fakerEN_IN.helpers.arrayElement(SPORTS)} Club`,
                description: faker_1.fakerEN_IN.lorem.paragraph(),
                location: faker_1.fakerEN_IN.helpers.arrayElement(LOCATIONS),
                status: client_1.CommunityStatus.VERIFIED,
                ownerId: owner.id,
                members: {
                    create: faker_1.fakerEN_IN.helpers.arrayElements(players, 5).map((p) => ({
                        userId: p.id,
                    })),
                },
            },
        });
        communities.push(community);
    }
    // 6. Create Matches
    for (let i = 0; i < 15; i++) {
        const creator = faker_1.fakerEN_IN.helpers.arrayElement(players);
        const sport = faker_1.fakerEN_IN.helpers.arrayElement(SPORTS);
        const date = faker_1.fakerEN_IN.date.soon({ days: 10 });
        const maxPlayers = faker_1.fakerEN_IN.number.int({ min: 4, max: 14 });
        await prisma.match.create({
            data: {
                title: `Weekend ${sport} Match`,
                sport: sport,
                date: date,
                location: faker_1.fakerEN_IN.helpers.arrayElement(LOCATIONS),
                latitude: faker_1.fakerEN_IN.location.latitude({ min: 12.8, max: 13.1 }),
                longitude: faker_1.fakerEN_IN.location.longitude({ min: 77.5, max: 77.8 }),
                maxPlayers: maxPlayers,
                costPerPerson: faker_1.fakerEN_IN.number.int({ min: 100, max: 300 }),
                skillLevel: faker_1.fakerEN_IN.helpers.arrayElement([client_1.MatchSkillLevel.BEGINNER, client_1.MatchSkillLevel.INTERMEDIATE, client_1.MatchSkillLevel.ALL]),
                status: client_1.MatchStatus.OPEN,
                creatorId: creator.id,
                players: {
                    create: faker_1.fakerEN_IN.helpers.arrayElements(players, { min: 1, max: maxPlayers - 1 }).map((p) => ({
                        userId: p.id,
                        status: 'APPROVED',
                    })),
                },
            },
        });
    }
    // 7. Create Feed Posts
    for (let i = 0; i < 30; i++) {
        const author = faker_1.fakerEN_IN.helpers.arrayElement(users);
        const type = faker_1.fakerEN_IN.helpers.arrayElement([client_1.PostType.GENERAL, client_1.PostType.LOOKING_FOR_PLAYERS, client_1.PostType.QUESTION]);
        await prisma.post.create({
            data: {
                content: faker_1.fakerEN_IN.lorem.sentences(2),
                type: type,
                location: faker_1.fakerEN_IN.helpers.arrayElement(LOCATIONS),
                authorId: author.id,
                tags: [faker_1.fakerEN_IN.helpers.arrayElement(SPORTS).toLowerCase()],
                replies: {
                    create: faker_1.fakerEN_IN.helpers.arrayElements(users, { min: 0, max: 3 }).map((u) => ({
                        content: faker_1.fakerEN_IN.lorem.sentence(),
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
//# sourceMappingURL=seed.js.map