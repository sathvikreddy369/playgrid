import { faker } from '@faker-js/faker';
import { MatchStatus, MatchSkillLevel, MatchPlayerStatus } from '@prisma/client';
import { getRandomPastDate, getRandomFutureDate, getDateAfter } from '../utils/time';
import { getRandomElements, getRandomInt, getWeightedRandom, SPORTS } from '../utils/helpers';

export const generateMatches = (count: number, users: any[], communities: any[]) => {
  const matches = [];
  const matchPlayers = [];
  const matchComments = [];

  for (let i = 0; i < count; i++) {
    const matchId = faker.string.uuid();
    const creator = users[Math.floor(Math.random() * users.length)];
    const community = Math.random() > 0.5 && communities.length > 0 
      ? communities[Math.floor(Math.random() * communities.length)] 
      : null;
    
    const isPast = Math.random() > 0.2; // 80% matches are in the past
    const date = isPast ? getRandomPastDate(12) : getRandomFutureDate(14);
    
    const status = isPast ? MatchStatus.COMPLETED : getWeightedRandom([
      { value: MatchStatus.OPEN, weight: 70 },
      { value: MatchStatus.FULL, weight: 20 },
      { value: MatchStatus.CANCELLED, weight: 10 }
    ]);

    const maxPlayers = getRandomInt(4, 22);
    const sport = getRandomElements(SPORTS, 1, 1)[0];

    matches.push({
      id: matchId,
      title: `${sport} Match at ${community ? community.location : 'Hyderabad'}`,
      sport,
      date,
      location: community ? community.location : 'Hyderabad Central',
      latitude: 17.3850 + (Math.random() - 0.5) * 0.1,
      longitude: 78.4867 + (Math.random() - 0.5) * 0.1,
      maxPlayers,
      costPerPerson: getRandomInt(100, 300),
      skillLevel: getWeightedRandom([
        { value: MatchSkillLevel.ALL, weight: 60 },
        { value: MatchSkillLevel.INTERMEDIATE, weight: 30 },
        { value: MatchSkillLevel.ADVANCED, weight: 10 }
      ]),
      status,
      creatorId: creator.id,
      communityId: community ? community.id : null,
      createdAt: isPast ? new Date(date.getTime() - 86400000 * 2) : new Date(), // Created 2 days before match
      updatedAt: date
    });

    // Add creator as player
    matchPlayers.push({
      id: faker.string.uuid(),
      matchId,
      userId: creator.id,
      status: MatchPlayerStatus.APPROVED,
      performanceRating: isPast ? getRandomInt(3, 5) : null,
      joinedAt: isPast ? new Date(date.getTime() - 86400000 * 2) : new Date()
    });

    // Add other players
    const playerCount = status === MatchStatus.FULL ? maxPlayers - 1 : getRandomInt(1, maxPlayers - 2);
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, playerCount);

    for (const u of shuffledUsers) {
      if (u.id === creator.id) continue;
      matchPlayers.push({
        id: faker.string.uuid(),
        matchId,
        userId: u.id,
        status: isPast ? MatchPlayerStatus.ATTENDED : MatchPlayerStatus.APPROVED,
        performanceRating: isPast ? getRandomInt(1, 5) : null, // MVP ratings
        joinedAt: isPast ? new Date(date.getTime() - 86400000) : new Date()
      });
    }

    // Add comments
    if (isPast) {
      const commentCount = getRandomInt(2, 6);
      const playersInMatch = matchPlayers.filter(mp => mp.matchId === matchId);
      for (let c = 0; c < commentCount; c++) {
        const commenter = playersInMatch[Math.floor(Math.random() * playersInMatch.length)];
        matchComments.push({
          id: faker.string.uuid(),
          matchId,
          userId: commenter.userId,
          content: getRandomElements([
            "Great game today guys!", 
            "I'll bring the ball next time.", 
            "Man of the match goes to our keeper!", 
            "Well played.",
            "Can we play an hour earlier next week?"
          ], 1, 1)[0],
          createdAt: getDateAfter(date, 1) // Commented within 1 day after match
        });
      }
    }
  }

  return { matches, matchPlayers, matchComments };
};
