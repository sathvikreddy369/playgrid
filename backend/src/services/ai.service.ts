import { GoogleGenAI } from '@google/genai';

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export class AIService {
  async summarizeReviews(reviews: string[]): Promise<string> {
    if (!ai || reviews.length === 0) return '';

    const prompt = `
      Here are several user reviews for a sports venue:
      ${reviews.map(r => '- ' + r).join('\n')}

      Please write a concise 2-sentence summary of the general consensus of these reviews.
    `;

    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      return response.text || '';
    } catch (e) {
      console.error('AI Review Summarization failed', e);
      return '';
    }
  }
  async moderateContent(content: string): Promise<{ isSafe: boolean; reason?: string }> {
    if (!ai || !content) return { isSafe: true };

    const prompt = `
      You are an automated community moderator. Analyze the following user post content for hate speech, extreme toxicity, illegal activities, or severe spam. 
      Return ONLY a strict JSON object (no markdown wrapping) with these keys:
      - "isSafe": boolean (true if it's acceptable, false if it violates community guidelines)
      - "reason": string (a short explanation if isSafe is false)
      
      Content: "${content}"
    `;

    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      let jsonStr = response.text || "{}";
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        isSafe: parsed.isSafe !== false,
        reason: parsed.reason,
      };
    } catch (e) {
      console.error('AI Moderation failed', e);
      return { isSafe: true }; // Fail open
    }
  }
}

export const aiService = new AIService();
