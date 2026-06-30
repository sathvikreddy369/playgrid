"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const genai_1 = require("@google/genai");
const ai = process.env.GEMINI_API_KEY ? new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
class AIService {
    async moderateContent(text) {
        if (!ai)
            return { isSpam: false, reason: 'AI disabled' };
        const prompt = `
      Analyze the following text for spam, hate speech, explicit content, or crypto/scam solicitation.
      Text: "${text}"
      
      Respond in strict JSON format (no markdown):
      {
        "isSpam": true/false,
        "reason": "short explanation if true"
      }
    `;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const jsonStr = (response.text || "{}").replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (e) {
            console.error('AI Moderation failed', e);
            return { isSpam: false, reason: 'Error checking' };
        }
    }
    async detectFakeEvent(title, sport, cost) {
        if (!ai)
            return { isFake: false, reason: 'AI disabled' };
        const prompt = `
      Analyze this newly created sports match to see if it looks like a fake event, a scam, a non-sports seminar, or has an absurd price for a casual game.
      Title: "${title}"
      Sport: "${sport}"
      Cost Per Person: $${cost}
      
      Respond in strict JSON format (no markdown):
      {
        "isFake": true/false,
        "reason": "short explanation if true"
      }
    `;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const jsonStr = (response.text || "{}").replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (e) {
            console.error('AI Fake Event check failed', e);
            return { isFake: false, reason: 'Error checking' };
        }
    }
    async summarizeReviews(reviews) {
        if (!ai || reviews.length === 0)
            return '';
        const prompt = `
      Here are several user reviews for a sports venue:
      ${reviews.map(r => '- ' + r).join('\n')}

      Please write a concise 2-sentence summary of the general consensus of these reviews.
    `;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            return response.text || '';
        }
        catch (e) {
            console.error('AI Review Summarization failed', e);
            return '';
        }
    }
    async getRecommendations(userProfile, matches) {
        if (!ai || matches.length === 0)
            return [];
        // Map matches to a simpler object for the AI to parse to save tokens
        const availableMatches = matches.map(m => ({
            id: m.id,
            title: m.title,
            sport: m.sport,
            location: m.location
        }));
        const prompt = `
      You are a sports matchmaking assistant.
      User's preferred sports: ${userProfile.sports?.join(', ')}
      
      Here are the available upcoming matches:
      ${JSON.stringify(availableMatches)}

      Pick the top 3 best matches for this user. 
      Respond in strict JSON format (no markdown) as an array of objects:
      [
        {
          "matchId": "id of the match",
          "reason": "1 sentence explanation of why it's a good fit"
        }
      ]
    `;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const jsonStr = (response.text || "[]").replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            const recommendations = JSON.parse(jsonStr);
            // Hydrate back with full match data
            return recommendations.map((rec) => ({
                match: matches.find(m => m.id === rec.matchId),
                reason: rec.reason
            })).filter((r) => r.match !== undefined);
        }
        catch (e) {
            console.error('AI Recommendations failed', e);
            return [];
        }
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
