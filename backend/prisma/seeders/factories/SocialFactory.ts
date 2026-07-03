import { faker } from '@faker-js/faker';
import { PostType } from '@prisma/client';
import { getRandomPastDate, getDateAfter } from '../utils/time';
import { getRandomElements, getRandomInt, getWeightedRandom, SPORTS } from '../utils/helpers';
import { HYDERABAD_AREAS } from '../utils/locations';

const POST_TEMPLATES = {
  [PostType.LOOKING_FOR_PLAYERS]: [
    "Need 2 players for Box Cricket tomorrow morning at %LOCATION%.",
    "Looking for a goalkeeper for our match this Sunday.",
    "Anyone up for Badminton tonight? Got a spare racket."
  ],
  [PostType.LOOKING_FOR_TEAM]: [
    "Intermediate batsman looking for a weekend cricket team in %LOCATION%.",
    "Just moved to %LOCATION%, looking for regular football groups.",
    "Anyone playing tennis regularly around here?"
  ],
  [PostType.GENERAL]: [
    "What a crazy match yesterday! Hats off to the opposition.",
    "Has anyone tried the new turf in %LOCATION%? Is it good?",
    "Hyd weather is perfect for a game today."
  ]
};

export const generateSocials = (count: number, users: any[], communities: any[]) => {
  const posts = [];
  const replies = [];
  const postLikes = [];

  for (let i = 0; i < count; i++) {
    const postId = faker.string.uuid();
    const author = users[Math.floor(Math.random() * users.length)];
    const community = Math.random() > 0.7 && communities.length > 0 
      ? communities[Math.floor(Math.random() * communities.length)] 
      : null;
    
    const type = getWeightedRandom([
      { value: PostType.LOOKING_FOR_PLAYERS, weight: 40 },
      { value: PostType.LOOKING_FOR_TEAM, weight: 30 },
      { value: PostType.GENERAL, weight: 30 }
    ]);

    const templateArray = POST_TEMPLATES[type as keyof typeof POST_TEMPLATES];
    const rawTemplate = templateArray[Math.floor(Math.random() * templateArray.length)];
    const locationName = HYDERABAD_AREAS[Math.floor(Math.random() * HYDERABAD_AREAS.length)].name;
    const content = rawTemplate.replace('%LOCATION%', locationName);

    const createdAt = getRandomPastDate(12);

    posts.push({
      id: postId,
      content,
      type,
      location: locationName,
      latitude: null, // For simplicity
      longitude: null,
      authorId: author.id,
      communityId: community ? community.id : null,
      tags: getRandomElements(SPORTS, 0, 2),
      isEdited: Math.random() > 0.9,
      createdAt,
      updatedAt: createdAt
    });

    // Likes
    const likeCount = getRandomInt(0, 15);
    const shuffledLikingUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, likeCount);
    for (const u of shuffledLikingUsers) {
      postLikes.push({
        id: faker.string.uuid(),
        userId: u.id,
        postId,
        createdAt: getDateAfter(createdAt, 5)
      });
    }

    // Replies
    const replyCount = getRandomInt(0, 5);
    const shuffledReplyingUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, replyCount);
    for (const u of shuffledReplyingUsers) {
      replies.push({
        id: faker.string.uuid(),
        content: getRandomElements(["Interested!", "DM sent.", "I can join.", "Where exactly?", "Me too!"], 1, 1)[0],
        postId,
        authorId: u.id,
        parentId: null,
        isEdited: false,
        createdAt: getDateAfter(createdAt, 2),
        updatedAt: getDateAfter(createdAt, 2)
      });
    }
  }

  return { posts, replies, postLikes };
};
