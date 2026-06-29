export declare class FraudDetection {
    /**
     * Checks if the content contains blocked words.
     */
    static containsProfanityOrSpam(content: string): boolean;
    /**
     * Checks if the user is posting exact duplicates within a short timeframe.
     */
    static isDuplicatePost(userId: string, content: string): Promise<boolean>;
}
//# sourceMappingURL=fraudDetection.d.ts.map