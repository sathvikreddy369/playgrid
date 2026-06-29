export declare class ReplyService {
    createReply(userId: string, postId: string, content: string, parentId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        isEdited: boolean;
        postId: string;
        parentId: string | null;
    }>;
    deleteReply(replyId: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        isEdited: boolean;
        postId: string;
        parentId: string | null;
    }>;
    toggleLike(replyId: string, userId: string): Promise<{
        liked: boolean;
    }>;
}
export declare const replyService: ReplyService;
//# sourceMappingURL=reply.service.d.ts.map