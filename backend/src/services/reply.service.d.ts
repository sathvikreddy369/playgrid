export declare class ReplyService {
    createReply(userId: string, postId: string, content: string, parentId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        isEdited: boolean;
        authorId: string;
        parentId: string | null;
        postId: string;
    }>;
    deleteReply(replyId: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        isEdited: boolean;
        authorId: string;
        parentId: string | null;
        postId: string;
    }>;
    toggleLike(replyId: string, userId: string): Promise<{
        liked: boolean;
    }>;
}
export declare const replyService: ReplyService;
//# sourceMappingURL=reply.service.d.ts.map