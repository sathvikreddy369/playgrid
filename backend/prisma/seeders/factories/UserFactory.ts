import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';
import { getRandomName, getRandomAvatar } from '../utils/names';
import { getRandomLocation } from '../utils/locations';
import { getRandomPastDate } from '../utils/time';
import { getWeightedRandom, getRandomElements, SPORTS, E_SPORTS } from '../utils/helpers';

export const generateUsers = (count: number) => {
  const users = [];
  const profiles = [];
  const userTrusts = [];

  for (let i = 0; i < count; i++) {
    const userId = faker.string.uuid();
    const name = getRandomName();
    const location = getRandomLocation();
    const createdAt = getRandomPastDate(24);
    
    // Determine Role
    const role = getWeightedRandom([
      { value: Role.PLAYER, weight: 80 },
      { value: Role.ORGANIZER, weight: 15 },
      { value: Role.ADMIN, weight: 5 },
    ]);

    // Construct User
    users.push({
      id: userId,
      firebaseUid: faker.string.uuid(), // Mock firebase uid
      email: `user${i}_${faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }).toLowerCase()}`,
      name,
      role,
      reputation: faker.number.int({ min: 50, max: 500 }),
      isBlocked: Math.random() > 0.98, // 2% blocked
      isOnline: Math.random() > 0.8, // 20% online
      lastActive: faker.date.recent({ days: 7 }), // active in last 7 days
      createdAt,
      updatedAt: createdAt,
    });

    // Skill levels object
    const userSports = getRandomElements(SPORTS, 1, 3);
    const skillLevels: any = {};
    userSports.forEach(s => {
      skillLevels[s] = getWeightedRandom([
        { value: 'BEGINNER', weight: 40 },
        { value: 'INTERMEDIATE', weight: 40 },
        { value: 'ADVANCED', weight: 15 },
        { value: 'PRO', weight: 5 },
      ]);
    });

    const isStudent = Math.random() > 0.6;
    let bio = faker.person.bio();
    if (isStudent) {
      bio = `Student in Hyderabad. Love playing ${userSports[0]} on weekends.`;
    }

    profiles.push({
      id: faker.string.uuid(),
      userId,
      bio,
      avatarUrl: getRandomAvatar(name),
      location: location.name,
      sports: userSports,
      favoriteGames: getRandomElements(E_SPORTS, 0, 2),
      age: faker.number.int({ min: 18, max: 45 }),
      homeLatitude: location.lat,
      homeLongitude: location.lng,
      preferredPlayTimes: getRandomElements(['Weekdays Evening', 'Weekends Morning', 'Weekends Evening', 'Late Night'], 1, 2),
      skillLevels,
    });

    const totalJoined = faker.number.int({ min: 0, max: 100 });
    const totalAttended = Math.floor(totalJoined * faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }));
    const totalNoShows = totalJoined - totalAttended - faker.number.int({ min: 0, max: Math.floor(totalJoined * 0.1) });
    const hosted = faker.number.int({ min: 0, max: 50 });
    const rating = faker.number.float({ min: 3, max: 5, fractionDigits: 2 });
    const reviews = faker.number.int({ min: 0, max: 50 });

    userTrusts.push({
      id: faker.string.uuid(),
      userId,
      totalMatchesJoined: totalJoined,
      totalMatchesAttended: totalAttended,
      totalNoShows: Math.max(0, totalNoShows),
      totalLateCancellations: faker.number.int({ min: 0, max: 5 }),
      totalMatchesHosted: hosted,
      totalMatchesCancelledByHost: faker.number.int({ min: 0, max: Math.floor(hosted * 0.1) }),
      averagePlayerRating: rating,
      totalPlayerReviews: reviews,
      averageHostRating: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
      totalHostReviews: faker.number.int({ min: 0, max: 20 }),
      internalTrustScore: faker.number.float({ min: 200, max: 900, fractionDigits: 2 }),
      trustCategory: faker.helpers.arrayElement(['NEW', 'RELIABLE', 'NEEDS_IMPROVEMENT', 'EXCELLENT_HOST']),
    });
  }

  return { users, profiles, userTrusts };
};
