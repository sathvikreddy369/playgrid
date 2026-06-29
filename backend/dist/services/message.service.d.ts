export declare class MessageService {
    getConversations(userId: string): Promise<any[]>;
    getMessagesWithUser(userId: string, otherUserId: string, cursor?: string): Promise<{
        messages: ({
            sender: {
                name: string;
                id: string;
                profile: {
                    avatarUrl: string;
                };
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            isRead: boolean;
            senderId: string;
            receiverId: string;
        })[];
        nextCursor: string;
    }>;
    markAsRead(userId: string, otherUserId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
export declare const messageService: MessageService;
//# sourceMappingURL=message.service.d.ts.map