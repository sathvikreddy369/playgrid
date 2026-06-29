import { PostType } from '@prisma/client';
export declare class PostService {
    getPosts(filters: {
        type?: string;
        communityId?: string;
        authorId?: string;
    }, cursor?: string, limit?: number): Promise<{
        posts: ({
            author: {
                name: string;
                id: string;
                profile: {
                    avatarUrl: string;
                };
            };
            _count: {
                replies: number;
                likes: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            content: string;
            type: import(".prisma/client").$Enums.PostType;
            authorId: string;
            communityId: string | null;
            tags: string[];
            isEdited: boolean;
        })[];
        nextCursor: string;
    }>;
    getPostById(postId: string, userId?: string): Promise<{
        replies: ({
            author: {
                name: string;
                id: string;
                profile: {
                    avatarUrl: string;
                };
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
            authorId: string;
            isEdited: boolean;
            postId: string;
            parentId: string | null;
        })[];
        author: {
            name: string;
            id: string;
            profile: {
                avatarUrl: string;
            };
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
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        authorId: string;
        communityId: string | null;
        tags: string[];
        isEdited: boolean;
    }>;
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
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        authorId: string;
        communityId: string | null;
        tags: string[];
        isEdited: boolean;
    }>;
    updatePost(postId: string, userId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        authorId: string;
        communityId: string | null;
        tags: string[];
        isEdited: boolean;
    }>;
    deletePost(postId: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        content: string;
        type: import(".prisma/client").$Enums.PostType;
        authorId: string;
        communityId: string | null;
        tags: string[];
        isEdited: boolean;
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