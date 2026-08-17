import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GAMEVIA database with realistic Hyderabad venues & sports matches...');

  // Provision Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      supabaseId: 'admin-supabase-id-000',
      email: 'admin@gmail.com',
      role: 'ADMIN',
      profile: {
        create: {
          name: 'Platform Administrator',
          bio: 'GAMEVIA System Administrator & Moderation Lead',
          favoriteSports: ['Cricket', 'Football'],
          levels: ['Advanced']
        }
      }
    }
  });

  // Demo Turf Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@gamevia.com' },
    update: { role: 'GROUND_OWNER' },
    create: {
      supabaseId: 'owner-supabase-id-001',
      email: 'owner@gamevia.com',
      role: 'GROUND_OWNER',
      profile: {
        create: {
          name: 'Vikram Reddy',
          bio: 'Owner of Skyline Box Cricket & Turf Arenas across Hyderabad.',
          favoriteSports: ['Cricket', 'Football'],
          levels: ['Professional']
        }
      }
    }
  });

  // Demo Player User
  const playerUser = await prisma.user.upsert({
    where: { email: 'demo.player@playgrid.com' },
    update: {},
    create: {
      supabaseId: 'demo-player-supabase-id-002',
      email: 'demo.player@playgrid.com',
      role: 'USER',
      profile: {
        create: {
          name: 'Ananya Sharma',
          bio: 'Always up for weekend box cricket & badminton games!',
          favoriteSports: ['Football', 'Badminton', 'Cricket'],
          levels: ['Intermediate']
        }
      }
    }
  });

  // Seed Approved Venues around Narayanguda, Himayatnagar, Gachibowli, Madhapur
  const venuesData = [
    {
      ownerId: ownerUser.id,
      name: 'Narayanguda Net Cricket & Turf Box',
      description: 'Floodlit net cricket turf with high-quality artificial turf mats and digital scoreboard.',
      category: 'Box Cricket',
      sports: ['Cricket'],
      address: 'Near Old MLA Quarters, Narayanguda, Hyderabad',
      locality: 'Narayanguda',
      latitude: 17.3968,
      longitude: 78.4888,
      pricePerHour: 1200,
      ownerPhone: '+91 98765 43210',
      images: [
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=60'
      ],
      amenities: ['Floodlights', 'Cricket Kit', 'Digital Scoreboard', 'Parking', 'Mineral Water'],
      status: 'APPROVED' as const,
      rating: 4.8,
      reviewCount: 14
    },
    {
      ownerId: ownerUser.id,
      name: 'Himayatnagar Smash Badminton Arena',
      description: 'BWF synthetic indoor badminton courts with air-cooled seating and pro shop.',
      category: 'Badminton Court',
      sports: ['Badminton'],
      address: 'Street No. 3, Himayatnagar, Hyderabad',
      locality: 'Himayatnagar',
      latitude: 17.4018,
      longitude: 78.4815,
      pricePerHour: 500,
      ownerPhone: '+91 98765 43211',
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60'
      ],
      amenities: ['Synthetic Flooring', 'Racket Rental', 'Changing Rooms', 'Drinking Water'],
      status: 'APPROVED' as const,
      rating: 4.7,
      reviewCount: 9
    },
    {
      ownerId: ownerUser.id,
      name: 'Basheerbagh Kickoff 5v5 Football Turf',
      description: 'FIFA-approved artificial grass turf for 5v5 and 7v7 football matches.',
      category: 'Football Turf',
      sports: ['Football'],
      address: 'Main Road, Basheerbagh, Hyderabad',
      locality: 'Basheerbagh',
      latitude: 17.3995,
      longitude: 78.4760,
      pricePerHour: 1500,
      ownerPhone: '+91 98765 43212',
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60'
      ],
      amenities: ['Night Floodlights', 'Bibs & Balls', 'Shower Rooms', 'Cafeteria'],
      status: 'APPROVED' as const,
      rating: 4.9,
      reviewCount: 22
    },
    {
      ownerId: ownerUser.id,
      name: 'Abids Aqua Splash Swimming Club',
      description: 'Temperature-controlled half-Olympic swimming pool with certified lifeguard supervision.',
      category: 'Swimming Pool',
      sports: ['Swimming'],
      address: 'Station Road, Abids, Hyderabad',
      locality: 'Abids',
      latitude: 17.3870,
      longitude: 78.4770,
      pricePerHour: 350,
      ownerPhone: '+91 98765 43213',
      images: [
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=60'
      ],
      amenities: ['Heated Pool', 'Lifeguard', 'Locker Rooms', 'Costume Rental'],
      status: 'APPROVED' as const,
      rating: 4.6,
      reviewCount: 11
    },
    {
      ownerId: ownerUser.id,
      name: 'Gachibowli Pro Pickleball Courts',
      description: 'Hard surface dedicated pickleball courts with tournament-grade net setup.',
      category: 'Pickleball Court',
      sports: ['Pickleball'],
      address: 'Financial District, Gachibowli, Hyderabad',
      locality: 'Gachibowli',
      latitude: 17.4401,
      longitude: 78.3489,
      pricePerHour: 600,
      ownerPhone: '+91 98765 43214',
      images: [
        'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=60'
      ],
      amenities: ['Paddle Rental', 'Night Lights', 'Hydration Station'],
      status: 'APPROVED' as const,
      rating: 4.8,
      reviewCount: 7
    },
    {
      ownerId: ownerUser.id,
      name: 'Pending Turf Application Demo',
      description: 'Newly submitted venue application awaiting admin verification.',
      category: 'Box Cricket',
      sports: ['Cricket'],
      address: 'RTC X Roads, Musheerabad, Hyderabad',
      locality: 'RTC X Roads',
      latitude: 17.4045,
      longitude: 78.4980,
      pricePerHour: 1100,
      ownerPhone: '+91 98765 43215',
      images: [],
      amenities: ['Floodlights'],
      status: 'PENDING_APPROVAL' as const,
      rating: 5.0,
      reviewCount: 0
    }
  ];

  for (const v of venuesData) {
    await prisma.venue.create({ data: v });
  }

  // Create Physical Matches linked to venues
  const narayangudaVenue = await prisma.venue.findFirst({ where: { locality: 'Narayanguda' } });
  const himayatnagarVenue = await prisma.venue.findFirst({ where: { locality: 'Himayatnagar' } });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  if (narayangudaVenue) {
    await prisma.match.create({
      data: {
        hostId: ownerUser.id,
        venueId: narayangudaVenue.id,
        title: 'Narayanguda Evening Box Cricket 6v6',
        description: 'Friendly 6v6 box cricket match at Narayanguda Net Turf. Tennis ball provided.',
        matchType: 'PHYSICAL',
        locationText: narayangudaVenue.address,
        latitude: narayangudaVenue.latitude,
        longitude: narayangudaVenue.longitude,
        date: tomorrow,
        totalSlots: 12,
        filledSlots: 7,
        status: 'AVAILABLE',
        tags: ['cricket', 'narayanguda', 'boxcricket'],
        pricePerHead: 150
      }
    });
  }

  if (himayatnagarVenue) {
    await prisma.match.create({
      data: {
        hostId: ownerUser.id,
        venueId: himayatnagarVenue.id,
        title: 'Himayatnagar Intermediate Badminton Doubles',
        description: 'Need 2 intermediate players for feather shuttle doubles session.',
        matchType: 'PHYSICAL',
        locationText: himayatnagarVenue.address,
        latitude: himayatnagarVenue.latitude,
        longitude: himayatnagarVenue.longitude,
        date: tomorrow,
        totalSlots: 4,
        filledSlots: 2,
        status: 'AVAILABLE',
        tags: ['badminton', 'himayatnagar', 'doubles'],
        pricePerHead: 125
      }
    });
  }

  console.log('✅ Successfully seeded GAMEVIA database with admin user and Narayanguda/Himayatnagar venues!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
