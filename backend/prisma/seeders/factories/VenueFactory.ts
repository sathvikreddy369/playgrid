import { faker } from '@faker-js/faker';
import { VenueStatus } from '@prisma/client';
import { getRandomLocation, getNearbylocation } from '../utils/locations';
import { getRandomPastDate } from '../utils/time';
import { getRandomElements, SPORTS, getRandomInt, getWeightedRandom } from '../utils/helpers';

const REAL_HYD_VENUES = [
  { name: 'Astro Park', loc: 'Jubilee Hills', lat: 17.4326, lng: 78.4071, desc: 'Premium 5v5 and 7v7 football turf with excellent FIFA approved turf quality.' },
  { name: 'HotFut', loc: 'Begumpet', lat: 17.4447, lng: 78.4664, desc: 'Rooftop sports arena offering Football, Box Cricket, and more.' },
  { name: 'GamePoint', loc: 'Madhapur', lat: 17.4483, lng: 78.3915, desc: 'Multi-sports center with Badminton, Squash, Table Tennis, and Basketball.' },
  { name: 'FSV Arena', loc: 'Kondapur', lat: 17.4614, lng: 78.3587, desc: 'Large arena suitable for 9v9 football matches and professional coaching.' },
  { name: 'CricTurf', loc: 'Gachibowli', lat: 17.4401, lng: 78.3489, desc: 'Specialized box cricket arenas with bowling machines and auto-scoring.' }
];

export const generateVenues = (count: number, users: any[]) => {
  const venues = [];
  const venueReviews = [];

  const organizers = users.filter(u => u.role === 'ORGANIZER' || u.role === 'ADMIN');
  if (organizers.length === 0) throw new Error("Need organizers to own venues");

  for (let i = 0; i < count; i++) {
    const venueId = faker.string.uuid();
    const owner = organizers[Math.floor(Math.random() * organizers.length)];
    const locationObj = getRandomLocation();
    const preciseLoc = getNearbylocation(locationObj.lat, locationObj.lng, 1);
    const createdAt = getRandomPastDate(24);

    const baseVenue = REAL_HYD_VENUES[i % REAL_HYD_VENUES.length];
    const name = i < REAL_HYD_VENUES.length ? baseVenue.name : `${baseVenue.name} ${faker.string.alpha(3).toUpperCase()}`;

    venues.push({
      id: venueId,
      name,
      location: `${baseVenue.loc}, Hyderabad`,
      latitude: baseVenue.lat + (Math.random() - 0.5) * 0.01,
      longitude: baseVenue.lng + (Math.random() - 0.5) * 0.01,
      pricing: `${getRandomInt(800, 2500)} INR per hour`,
      amenities: getRandomElements(['Washrooms', 'Floodlights', 'Parking', 'Drinking Water', 'Sitting Area', 'Equipment Rental'], 3, 6),
      sports: getRandomElements(SPORTS, 1, 3),
      photos: [
        `https://images.unsplash.com/photo-1540314227092-23c28a8d11c7?w=800&auto=format&fit=crop&q=80`,
        `https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80`
      ],
      description: baseVenue.desc,
      contactEmail: `info@${name.replace(/\s+/g, '').toLowerCase()}.com`,
      website: `https://${name.replace(/\s+/g, '').toLowerCase()}.com`,
      contactPhone: `+91 9${faker.string.numeric(9)}`,
      status: VenueStatus.VERIFIED,
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
      
      const comment = rating > 3 ? reviewTexts[0] : reviewTexts[2];
      const reviewDate = getRandomPastDate(12);

      venueReviews.push({
        id: faker.string.uuid(),
        venueId,
        userId: u.id,
        rating,
        comment: comment,
        createdAt: reviewDate,
      });
    }
  }

  return { venues, venueReviews };
};
