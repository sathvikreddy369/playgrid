"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const db_1 = __importDefault(require("../utils/db"));
const genai_1 = require("@google/genai");
// Initialize Gemini if key exists
const ai = process.env.GEMINI_API_KEY ? new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
class SearchService {
    async globalSearch(query, type) {
        const results = {};
        const searchStr = `%${query}%`;
        // 1. Matches
        if (type === 'ALL' || type === 'MATCHES') {
            results.matches = await db_1.default.match.findMany({
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
            results.communities = await db_1.default.community.findMany({
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
            results.grounds = await db_1.default.ground.findMany({
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
            results.users = await db_1.default.user.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' }
                },
                include: { profile: { select: { avatarUrl: true, sports: true } } },
                take: 10
            });
        }
        return results;
    }
    async nearbySearch(lat, lng, radiusKm, type = 'MATCHES') {
        // Haversine formula in Postgres
        if (type === 'GROUNDS') {
            const grounds = await db_1.default.$queryRaw `
        SELECT id, name, location, latitude, longitude,
        (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
        FROM "Ground"
        WHERE status = 'VERIFIED' AND latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) < ${radiusKm}
        ORDER BY distance ASC
        LIMIT 20;
      `;
            // To hydrate with Prisma relations if needed, we can map IDs, but raw gives us distance.
            // We will fetch full objects using the IDs returned.
            const groundIds = grounds.map(g => g.id);
            const fullGrounds = await db_1.default.ground.findMany({ where: { id: { in: groundIds } } });
            // Merge distance
            return fullGrounds.map(g => {
                const raw = grounds.find(r => r.id === g.id);
                return { ...g, distance: raw?.distance };
            }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        if (type === 'MATCHES') {
            const matches = await db_1.default.$queryRaw `
        SELECT id, title, location, latitude, longitude,
        (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
        FROM "Match"
        WHERE status = 'OPEN' AND latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) < ${radiusKm}
        ORDER BY distance ASC
        LIMIT 20;
      `;
            const matchIds = matches.map(m => m.id);
            const fullMatches = await db_1.default.match.findMany({
                where: { id: { in: matchIds } },
                include: { creator: { select: { name: true } }, _count: { select: { players: true } } }
            });
            return fullMatches.map(m => {
                const raw = matches.find(r => r.id === m.id);
                return { ...m, distance: raw?.distance };
            }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        return [];
    }
    async parseQueryWithAI(query) {
        if (!ai) {
            throw new Error('GEMINI_API_KEY is not configured on the server.');
        }
        const prompt = `
      You are an AI assistant for a sports matchmaking and venue discovery platform called Playgrid.
      The user typed the following search query: "${query}"

      Parse this query and return ONLY a strict JSON object with the following optional keys (do not include markdown wrapping):
      - "type": ONE OF ["MATCHES", "GROUNDS", "COMMUNITIES", "USERS", "ALL"] (determine the intent).
      - "sport": string (if a specific sport is mentioned).
      - "maxCost": number (if a price or "free" is mentioned. "free" = 0).
      - "dateKeyword": string (e.g. "today", "tomorrow", "weekend").
      - "locationQuery": string (if a specific city/place is mentioned).

      If no specific filter is found for a key, omit the key.
      Return ONLY valid JSON.
    `;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            let jsonStr = response.text || "{}";
            // Clean markdown formatting if AI included it despite instructions
            jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            return parsed;
        }
        catch (error) {
            console.error('AI Parsing Error:', error);
            throw new Error('Failed to parse query with AI.');
        }
    }
    async applyAIFilters(filters) {
        // Take the AI JSON and convert it to Prisma queries.
        // For simplicity, we just return the raw query params to let the controller fetch standard globalSearch,
        // or we can build a dynamic Prisma query here.
        const where = {};
        if (filters.sport)
            where.sport = { contains: filters.sport, mode: 'insensitive' };
        if (filters.maxCost !== undefined)
            where.costPerPerson = { lte: filters.maxCost };
        if (filters.locationQuery)
            where.location = { contains: filters.locationQuery, mode: 'insensitive' };
        // Quick example logic for matches based on AI filters
        if (filters.type === 'MATCHES' || !filters.type) {
            where.status = 'OPEN';
            const matches = await db_1.default.match.findMany({
                where,
                include: { creator: { select: { name: true } }, _count: { select: { players: true } } },
                take: 20
            });
            return { matches, aiFiltersApplied: filters };
        }
        // Fallback if AI requested something else (Grounds, etc)
        return { error: "AI specific filtering only fully implemented for MATCHES in MVP", aiFiltersApplied: filters };
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
