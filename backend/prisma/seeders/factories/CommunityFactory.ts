import { faker } from '@faker-js/faker';
import { CommunityStatus } from '@prisma/client';
import { getRandomLocation } from '../utils/locations';
import { getRandomPastDate } from '../utils/time';
import { getRandomElements, getRandomInt } from '../utils/helpers';

const COMMUNITY_NAMES = [
  'Hyderabad Weekend Cricket', 'KMIT Cricket Club', 'Hyderabad Football Club', 
  'Women Badminton Hyderabad', 'Corporate Cricket Hyderabad', 'Sunday Cyclists', 
  'Pickleball Hyderabad', 'Weekend Box Cricket', 'Gachibowli Techies Sports', 
  'Madhapur FC', 'Jubilee Hills Tennis', 'Hyderabad Runners', 'Secunderabad Swimmers',
  'Banjara Hoops', 'Kukatpally Smashers', 'Hitech City Gamers'
];

export const generateCommunities = (count: number, users: any[]) => {
  const communities = [];
  const communityMembers = [];
  
  // Potential owners (Organizers or Admins)
  const organizers = users.filter(u => u.role === 'ORGANIZER' || u.role === 'ADMIN');
  if (organizers.length === 0) throw new Error("Need organizers to create communities");

  const actualCount = Math.min(count, COMMUNITY_NAMES.length);

  for (let i = 0; i < actualCount; i++) {
    const communityId = faker.string.uuid();
    const owner = organizers[Math.floor(Math.random() * organizers.length)];
    const location = getRandomLocation();
    const createdAt = getRandomPastDate(20);

    communities.push({
      id: communityId,
      name: COMMUNITY_NAMES[i],
      description: `Welcome to ${COMMUNITY_NAMES[i]}. We are a group of passionate sports enthusiasts based in ${location.name}. Join us for weekly matches and tournaments!`,
      location: location.name,
      status: CommunityStatus.VERIFIED,
      ownerId: owner.id,
      createdAt,
      updatedAt: createdAt,
    });

    // Add owner as a member
    communityMembers.push({
      id: faker.string.uuid(),
      userId: owner.id,
      communityId,
      joinedAt: createdAt
    });

    // Add random members
    const memberCount = getRandomInt(10, 50);
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, memberCount);
    
    for (const u of shuffledUsers) {
      if (u.id === owner.id) continue;
      communityMembers.push({
        id: faker.string.uuid(),
        userId: u.id,
        communityId,
        joinedAt: getRandomPastDate(18) // slightly after community creation
      });
    }
  }

  return { communities, communityMembers };
};
