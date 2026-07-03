import { faker } from '@faker-js/faker';

export const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomElements = <T>(arr: T[], min: number, max: number): T[] => {
  const count = getRandomInt(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getWeightedRandom = <T>(items: { value: T, weight: number }[]): T => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.value;
    }
  }
  return items[0].value;
};

// Helper for realistic sports and games
export const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Volleyball', 'Table Tennis', 'Swimming'];
export const E_SPORTS = ['FIFA', 'BGMI', 'Valorant', 'CS2', 'Call of Duty'];
