export declare class AIService {
    moderateContent(text: string): Promise<{
        isSpam: boolean;
        reason: string;
    }>;
    detectFakeEvent(title: string, sport: string, cost: number): Promise<{
        isFake: boolean;
        reason: string;
    }>;
    summarizeReviews(reviews: string[]): Promise<string>;
    getRecommendations(userProfile: any, matches: any[]): Promise<any[]>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map