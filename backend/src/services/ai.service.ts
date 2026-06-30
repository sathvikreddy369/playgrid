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
}

export const aiService = new AIService();
