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
   * Checks if a match seems like a fake event or scam based on deterministic rules.
   */
  static isFakeEvent(title: string, cost: number): { isFake: boolean; reason?: string } {
    const lowerTitle = title.toLowerCase();
    
    // Check for absurd costs for casual games (e.g. > $1000)
    if (cost > 1000) {
      return { isFake: true, reason: 'Cost exceeds maximum threshold for casual matches.' };
    }

    // Check for scammy keywords in the title
    const scamKeywords = ['crypto', 'invest', 'seminar', 'guaranteed returns', 'free money'];
    for (const word of scamKeywords) {
      if (lowerTitle.includes(word)) {
        return { isFake: true, reason: 'Title contains flagged scam or solicitation keywords.' };
      }
    }

    return { isFake: false };
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
