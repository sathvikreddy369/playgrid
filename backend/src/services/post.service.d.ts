import { PostType } from '@prisma/client';
export declare class PostService {
    getPosts(filters: {
        type?: string;
        communityId?: string;
        authorId?: string;
    }, cursor?: string, limit?: number): Promise<{
        posts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            communityId: string | null;
            content: string;
            type: import(".prisma/client").$Enums.PostType;
            tags: string[];
            isEdited: boolean;
            authorId: string;
        }[];
        nextCursor: string | undefined;
    }>;
    getPostById(postId: string, userId?: string): Promise<({
        replies: ({
            author: {
                id: string;
                name: string;
                profile: {
                    avatarUrl: string | null;
                } | null;
            };
            _count: {
                replies: number;
                likes: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            isEdited: boolean;
            authorId: string;
            parentId: string | null;
            postId: string;
        })[];
        author: {
            id: string;
            name: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
        likes: {
            id: string;
            createdAt: Date;
            userId: string;
            postId: string;
        }[];
        savedBy: {
            id: string;
            createdAt: Date;
            userId: string;
            postId: string;
        }[];
        _count: {
            replies: number;
            likes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        communityId: string | null;
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        tags: string[];
        isEdited: boolean;
        authorId: string;
    }) | null>;
    createPost(userId: string, data: {
        content: string;
        type?: PostType;
        location?: string;
        tags?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        communityId: string | null;
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        tags: string[];
        isEdited: boolean;
        authorId: string;
    }>;
    updatePost(postId: string, userId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        communityId: string | null;
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        tags: string[];
        isEdited: boolean;
        authorId: string;
    }>;
    deletePost(postId: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        communityId: string | null;
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        tags: string[];
        isEdited: boolean;
        authorId: string;
    }>;
    toggleLike(postId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    toggleSave(postId: string, userId: string): Promise<{
        saved: boolean;
    }>;
}
export declare const postService: PostService;
//# sourceMappingURL=post.service.d.ts.map