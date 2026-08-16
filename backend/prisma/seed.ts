import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PlayGrid database with realistic Hyderabad sports matches...');

  // Create demo host user
  const hostUser = await prisma.user.upsert({
    where: { email: 'demo.host@playgrid.com' },
    update: {},
    create: {
      supabaseId: 'demo-host-supabase-id-001',
      email: 'demo.host@playgrid.com',
      role: 'USER',
      profile: {
        create: {
          name: 'Rahul Verma',
          bio: 'Passionate sports organizer in Gachibowli, Hyderabad.',
          matchesAttended: 24,
          favoriteSports: ['Cricket', 'Football', 'Badminton'],
          levels: ['Intermediate']
        }
      }
    }
  });

  const demoPlayer = await prisma.user.upsert({
    where: { email: 'demo.player@playgrid.com' },
    update: {},
    create: {
      supabaseId: 'demo-player-supabase-id-002',
      email: 'demo.player@playgrid.com',
      role: 'USER',
      profile: {
        create: {
          name: 'Ananya Sharma',
          bio: 'Always up for weekend football and badminton games!',
          matchesAttended: 12,
          favoriteSports: ['Football', 'Badminton'],
          levels: ['Beginner']
        }
      }
    }
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 30, 0, 0);

  const thisWeekend = new Date();
  thisWeekend.setDate(thisWeekend.getDate() + 3);
  thisWeekend.setHours(18, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);
  nextWeek.setHours(19, 0, 0, 0);

  // Matches
  const matchesData = [
    {
      hostId: hostUser.id,
      title: 'Sunday Morning Box Cricket 8v8',
      description: 'Looking for 6 enthusiastic players for a friendly 8v8 box cricket match at SkyTurf Gachibowli. Leather ball experience preferred!',
      isOnline: false,
      locationText: 'SkyTurf, Financial District, Gachibowli, Hyderabad',
      mapLink: 'https://maps.google.com/?q=Gachibowli+Hyderabad',
      latitude: 17.4401,
      longitude: 78.3489,
      date: tomorrow,
      isWeekend: true,
      totalSlots: 12,
      filledSlots: 6,
      status: 'AVAILABLE' as const,
      tags: ['cricket', 'gachibowli', 'weekend'],
      pricePerHead: 250
    },
    {
      hostId: hostUser.id,
      title: 'Weekend 7v7 Football Match',
      description: 'Competitive 7v7 football friendly at Jubilee Hills Turf. Good turf shoes recommended. Water bottles provided.',
      isOnline: false,
      locationText: 'Jubilee Hills Turf Grounds, Road No. 36, Hyderabad',
      mapLink: 'https://maps.google.com/?q=Jubilee+Hills+Hyderabad',
      latitude: 17.4319,
      longitude: 78.4072,
      date: thisWeekend,
      isWeekend: true,
      totalSlots: 14,
      filledSlots: 10,
      status: 'AVAILABLE' as const,
      tags: ['football', 'jubileehills', 'weekend'],
      pricePerHead: 300
    },
    {
      hostId: hostUser.id,
      title: 'Intermediate Badminton Doubles Session',
      description: 'Looking for 2 intermediate players for Yonex feather shuttle doubles session at Gopichand Badminton Academy.',
      isOnline: false,
      locationText: 'Gopichand Badminton Academy, Gachibowli, Hyderabad',
      mapLink: 'https://maps.google.com/?q=Gopichand+Badminton+Academy',
      latitude: 17.4447,
      longitude: 78.3483,
      date: nextWeek,
      isWeekend: false,
      totalSlots: 4,
      filledSlots: 2,
      status: 'AVAILABLE' as const,
      tags: ['badminton', 'gachibowli', 'doubles'],
      pricePerHead: 150
    },
    {
      hostId: hostUser.id,
      title: 'BGMI Squad Scrims & Customs',
      description: 'Online BGMI squad custom rooms with tier-2 teams. Join room with active mic and Discord voice channel.',
      isOnline: true,
      locationText: 'Online (Discord Lobby)',
      mapLink: null,
      latitude: null,
      longitude: null,
      date: nextWeek,
      isWeekend: false,
      totalSlots: 16,
      filledSlots: 16,
      status: 'FILLED' as const,
      tags: ['bgmi', 'esports', 'online'],
      pricePerHead: 0
    }
  ];

  for (const m of matchesData) {
    const createdMatch = await prisma.match.create({
      data: m
    });

    // Create a pending request from demoPlayer
    await prisma.request.create({
      data: {
        matchId: createdMatch.id,
        userId: demoPlayer.id,
        status: 'PENDING'
      }
    });
  }

  console.log('✅ Successfully seeded PlayGrid database with realistic Hyderabad sports matches!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
