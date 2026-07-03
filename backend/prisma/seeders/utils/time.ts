export const getRandomPastDate = (maxMonthsAgo: number = 24, minDaysAgo: number = 0) => {
  const now = new Date();
  const maxMs = maxMonthsAgo * 30 * 24 * 60 * 60 * 1000;
  const minMs = minDaysAgo * 24 * 60 * 60 * 1000;
  
  const randomMs = minMs + Math.random() * (maxMs - minMs);
  return new Date(now.getTime() - randomMs);
};

export const getRandomFutureDate = (maxDaysAhead: number = 30) => {
  const now = new Date();
  const maxMs = maxDaysAhead * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + Math.random() * maxMs);
};

// Generate a date that comes strictly AFTER another date (useful for replies, comments)
export const getDateAfter = (baseDate: Date, maxDaysAfter: number = 5) => {
  const maxMs = maxDaysAfter * 24 * 60 * 60 * 1000;
  const maxAllowed = Math.min(Date.now(), baseDate.getTime() + maxMs);
  const diff = maxAllowed - baseDate.getTime();
  
  return new Date(baseDate.getTime() + Math.random() * diff);
};
