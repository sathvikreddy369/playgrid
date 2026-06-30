import prisma from '../utils/db';
import { GoogleGenAI } from '@google/genai';
import { AppError } from '../utils/AppError';

// Initialize Gemini if key exists
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * Sanitizes user input before inserting into LLM prompts.
 * Prevents basic prompt injection by escaping and truncating.
 */
function sanitizeForPrompt(input: string, maxLength: number = 500): string {
  return input
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .slice(0, maxLength)
    .trim();
}

export class SearchService {
  async globalSearch(query: string, type: string) {
    const results: any = {};

    // 1. Matches
    if (type === 'ALL' || type === 'MATCHES') {
      results.matches = await prisma.match.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { sport: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
          status: 'OPEN'
        },
        include: { creator: { select: { name: true } }, _count: { select: { players: true } } },
        take: 10
      });
    }

    // 2. Communities
    if (type === 'ALL' || type === 'COMMUNITIES') {
      results.communities = await prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          status: 'VERIFIED'
        },
        include: { _count: { select: { members: true } } },
        take: 10
      });
    }

    // 3. Grounds
    if (type === 'ALL' || type === 'GROUNDS') {
      results.grounds = await prisma.ground.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
          ],
          status: 'VERIFIED'
        },
        take: 10
      });
    }

    // 4. Users
    if (type === 'ALL' || type === 'USERS') {
      results.users = await prisma.user.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        include: { profile: { select: { avatarUrl: true, sports: true } } },
        take: 10
      });
    }

    return results;
  }

  async nearbySearch(lat: number, lng: number, radiusKm: number, type: 'MATCHES' | 'GROUNDS' = 'MATCHES') {
    // Use a CTE (Common Table Expression) to calculate distance once and filter with WHERE
    if (type === 'GROUNDS') {
      const grounds = await prisma.$queryRaw`
        WITH ground_distances AS (
          SELECT id, name, location, latitude, longitude,
            (6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng}))
                + sin(radians(${lat})) * sin(radians(latitude))
              ))
            )) AS distance
          FROM "Ground"
          WHERE status = 'VERIFIED' AND latitude IS NOT NULL AND longitude IS NOT NULL
        )
        SELECT * FROM ground_distances
        WHERE distance < ${radiusKm}
        ORDER BY distance ASC
        LIMIT 20;
      `;

      const groundIds = (grounds as any[]).map(g => g.id);
      if (groundIds.length === 0) return [];

      const fullGrounds = await prisma.ground.findMany({ where: { id: { in: groundIds } } });
      
      // Merge distance
      return fullGrounds.map(g => {
        const raw = (grounds as any[]).find(r => r.id === g.id);
        return { ...g, distance: raw?.distance };
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    if (type === 'MATCHES') {
      const matches = await prisma.$queryRaw`
        WITH match_distances AS (
          SELECT id, title, location, latitude, longitude,
            (6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng}))
                + sin(radians(${lat})) * sin(radians(latitude))
              ))
            )) AS distance
          FROM "Match"
          WHERE status = 'OPEN' AND latitude IS NOT NULL AND longitude IS NOT NULL
        )
        SELECT * FROM match_distances
        WHERE distance < ${radiusKm}
        ORDER BY distance ASC
        LIMIT 20;
      `;

      const matchIds = (matches as any[]).map(m => m.id);
      if (matchIds.length === 0) return [];

      const fullMatches = await prisma.match.findMany({ 
        where: { id: { in: matchIds } },
        include: { creator: { select: { name: true } }, _count: { select: { players: true } } }
      });

      return fullMatches.map(m => {
        const raw = (matches as any[]).find(r => r.id === m.id);
        return { ...m, distance: raw?.distance };
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return [];
  }

  async parseQueryWithAI(query: string) {
    if (!ai) {
      throw new AppError('AI search is not available. GEMINI_API_KEY is not configured.', 503);
    }

    // Sanitize input to prevent prompt injection (H11)
    const sanitizedQuery = sanitizeForPrompt(query, 500);

    const prompt = `You are an AI assistant for a sports matchmaking platform called Playgrid.
Parse the following user search query and return ONLY a strict JSON object with these optional keys (no markdown wrapping):
- "type": ONE OF ["MATCHES", "GROUNDS", "COMMUNITIES", "USERS", "ALL"]
- "sport": string (if a specific sport is mentioned)
- "maxCost": number (if a price or "free" is mentioned; "free" = 0)
- "dateKeyword": string (e.g. "today", "tomorrow", "weekend")
- "locationQuery": string (if a specific city/place is mentioned)

If no specific filter is found for a key, omit the key.
Return ONLY valid JSON.

User query: "${sanitizedQuery}"`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let jsonStr = response.text || "{}";
      // Clean markdown formatting if AI included it despite instructions
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(jsonStr);

      // Validate output shape — only allow expected keys
      const allowedKeys = ['type', 'sport', 'maxCost', 'dateKeyword', 'locationQuery'];
      const filtered: Record<string, any> = {};
      for (const key of allowedKeys) {
        if (parsed[key] !== undefined) {
          filtered[key] = parsed[key];
        }
      }

      return filtered;
    } catch (error) {
      console.error('AI Parsing Error:', error);
      throw new AppError('Failed to parse query with AI.', 500);
    }
  }

  async applyAIFilters(filters: any) {
    const where: any = {};
    if (filters.sport) where.sport = { contains: String(filters.sport).slice(0, 100), mode: 'insensitive' };
    if (filters.maxCost !== undefined) where.costPerPerson = { lte: Number(filters.maxCost) || 0 };
    if (filters.locationQuery) where.location = { contains: String(filters.locationQuery).slice(0, 200), mode: 'insensitive' };
    
    if (filters.type === 'MATCHES' || !filters.type) {
      where.status = 'OPEN';
      const matches = await prisma.match.findMany({
        where,
        include: { creator: { select: { name: true } }, _count: { select: { players: true } } },
        take: 20
      });
      return { matches, aiFiltersApplied: filters };
    }
    
    return { error: "AI specific filtering only fully implemented for MATCHES in MVP", aiFiltersApplied: filters };
  }
}

export const searchService = new SearchService();
