import prisma from './db';

// Basic list of blocked words/patterns (profanity or spam)
const BLOCKED_WORDS = [
  'spam', 'scam', 'free money', 'click here', 'buy followers', 'cheap views'
];

export class FraudDetection {
  /**
   * Checks if the content contains blocked words.
   */
  static containsProfanityOrSpam(content: string): boolean {
    const lowerContent = content.toLowerCase();
    for (const word of BLOCKED_WORDS) {
      if (lowerContent.includes(word)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the user is posting exact duplicates within a short timeframe.
   */
  static async isDuplicatePost(userId: string, content: string): Promise<boolean> {
    // Check for exact same content posted by the same user in the last 10 minutes
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const recentDuplicate = await prisma.post.findFirst({
      where: {
        authorId: userId,
        content: content,
        createdAt: {
          gte: tenMinsAgo,
        }
      }
    });

    return !!recentDuplicate;
  }
}
