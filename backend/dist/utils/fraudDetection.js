"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetection = void 0;
const db_1 = __importDefault(require("./db"));
// Basic list of blocked words/patterns (profanity or spam)
const BLOCKED_WORDS = [
    'spam', 'scam', 'free money', 'click here', 'buy followers', 'cheap views'
];
class FraudDetection {
    /**
     * Checks if the content contains blocked words.
     */
    static containsProfanityOrSpam(content) {
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
    static async isDuplicatePost(userId, content) {
        // Check for exact same content posted by the same user in the last 10 minutes
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentDuplicate = await db_1.default.post.findFirst({
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
exports.FraudDetection = FraudDetection;
//# sourceMappingURL=fraudDetection.js.map