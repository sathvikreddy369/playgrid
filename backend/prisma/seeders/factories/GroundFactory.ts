import { faker } from '@faker-js/faker';
import { GroundStatus } from '@prisma/client';
import { getRandomLocation, getNearbylocation } from '../utils/locations';
import { getRandomPastDate } from '../utils/time';
import { getRandomElements, SPORTS, getRandomInt, getWeightedRandom } from '../utils/helpers';

const GROUND_PREFIXES = ['Royal', 'Elite', 'Pro', 'Champion', 'Super', 'Hyper', 'Green', 'Urban'];
const GROUND_SUFFIXES = ['Turf', 'Arena', 'Sports Club', 'Grounds', 'Box Cricket', 'Courts', 'Stadium'];

export const generateGrounds = (count: number, users: any[]) => {
  const grounds = [];
  const groundReviews = [];

  const organizers = users.filter(u => u.role === 'ORGANIZER' || u.role === 'ADMIN');
  if (organizers.length === 0) throw new Error("Need organizers to own grounds");

  for (let i = 0; i < count; i++) {
    const groundId = faker.string.uuid();
    const owner = organizers[Math.floor(Math.random() * organizers.length)];
    const locationObj = getRandomLocation();
    const preciseLoc = getNearbylocation(locationObj.lat, locationObj.lng, 1);
    const createdAt = getRandomPastDate(24);

    const name = `${getRandomElements(GROUND_PREFIXES, 1, 1)[0]} ${locationObj.name} ${getRandomElements(GROUND_SUFFIXES, 1, 1)[0]}`;

    grounds.push({
      id: groundId,
      name,
      location: `${locationObj.name}, Hyderabad`,
      latitude: preciseLoc.lat,
      longitude: preciseLoc.lng,
      pricing: `${getRandomInt(800, 2500)} INR per hour`,
      amenities: getRandomElements(['Washrooms', 'Floodlights', 'Parking', 'Drinking Water', 'Sitting Area', 'Equipment Rental'], 3, 6),
      sports: getRandomElements(SPORTS, 1, 3),
      photos: [
        `https://images.unsplash.com/photo-1540314227092-23c28a8d11c7?w=800&auto=format&fit=crop&q=80`,
        `https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80`
      ],
      contactPhone: `+91 9${faker.string.numeric(9)}`,
      status: GroundStatus.VERIFIED,
      ownerId: owner.id,
      aiSummary: 'Users appreciate the well-maintained turf and ample parking, though some mention the floodlights could be brighter during late-night games.',
      createdAt,
      updatedAt: createdAt,
    });

    // Generate reviews
    const reviewCount = getRandomInt(5, 20);
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, reviewCount);
    
    for (const u of shuffledUsers) {
      if (u.id === owner.id) continue;
      
      const rating = getWeightedRandom([
        { value: 5, weight: 50 },
        { value: 4, weight: 30 },
        { value: 3, weight: 15 },
        { value: 2, weight: 3 },
        { value: 1, weight: 2 },
      ]);

      const reviewTexts = [
        "Amazing turf, highly recommended!",
        "Good place for weekend matches.",
        "Pitch is a bit worn out but manageable.",
        "Great lighting and good parking space.",
        "Slightly overpriced but good facilities."
      ];

      groundReviews.push({
        id: faker.string.uuid(),
        groundId,
        userId: u.id,
        rating,
        comment: rating > 3 ? reviewTexts[0] : reviewTexts[2],
        createdAt: getRandomPastDate(12)
      });
    }
  }

  return { grounds, groundReviews };
};
