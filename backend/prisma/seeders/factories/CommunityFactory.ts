import { faker } from '@faker-js/faker';
import { CommunityStatus, CommunityPrivacy, CommunityRole, CommunityMemberStatus } from '@prisma/client';
import { getRandomLocation } from '../utils/locations';
import { getRandomPastDate } from '../utils/time';
import { getRandomElements, getRandomInt } from '../utils/helpers';

const SPORTS = ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Volleyball', 'Pickleball', 'Swimming'];
const TAGS = ['weekend', 'casual', 'competitive', 'beginners', 'fitness', 'after-work', 'social', 'tournament'];
const IMAGES = [
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
  'https://images.unsplash.com/photo-1518605368461-1e1e111ce70f?w=800&q=80',
  'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80',
  'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=800&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbb2bbc9ac?w=800&q=80'
];

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
      privacy: Math.random() > 0.8 ? CommunityPrivacy.PRIVATE : CommunityPrivacy.PUBLIC,
      ownerId: owner.id,
      sports: getRandomElements(SPORTS, getRandomInt(1, 3)),
      tags: getRandomElements(TAGS, getRandomInt(2, 4)),
      rules: ['Respect everyone', 'No spamming', 'Be on time for matches'],
      coverImage: IMAGES[i % IMAGES.length],
      avatarUrl: faker.image.avatar(),
      createdAt,
      updatedAt: createdAt,
    });

    // Add owner as a member
    communityMembers.push({
      id: faker.string.uuid(),
      userId: owner.id,
      communityId,
      role: CommunityRole.OWNER,
      status: CommunityMemberStatus.APPROVED,
      joinedAt: createdAt
    });

    // Add random members
    const memberCount = getRandomInt(10, 50);
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, memberCount);
    
    for (const u of shuffledUsers) {
      if (u.id === owner.id) continue;
      
      const isPending = communities[communities.length - 1].privacy === CommunityPrivacy.PRIVATE && Math.random() > 0.7;
      const role = Math.random() > 0.9 ? CommunityRole.MODERATOR : CommunityRole.MEMBER;

      communityMembers.push({
        id: faker.string.uuid(),
        userId: u.id,
        communityId,
        role: isPending ? CommunityRole.MEMBER : role,
        status: isPending ? CommunityMemberStatus.PENDING : CommunityMemberStatus.APPROVED,
        joinedAt: getRandomPastDate(18) // slightly after community creation
      });
    }
  }

  return { communities, communityMembers };
};
