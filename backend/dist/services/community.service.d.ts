import { CommunityStatus } from '@prisma/client';
export declare class CommunityService {
    createCommunity(userId: string, data: {
        name: string;
        description: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        description: string;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
    }>;
    getCommunities(status?: CommunityStatus): Promise<({
        _count: {
            members: number;
            matches: number;
        };
        owner: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        description: string;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
    })[]>;
    getCommunityById(id: string): Promise<{
        _count: {
            members: number;
            matches: number;
        };
        owner: {
            name: string;
            id: string;
            profile: {
                avatarUrl: string;
            };
        };
        members: ({
            user: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
                profile: {
                    avatarUrl: string;
                };
            };
        } & {
            id: string;
            userId: string;
            communityId: string;
            joinedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        description: string;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
    }>;
    joinCommunity(communityId: string, userId: string): Promise<{
        id: string;
        userId: string;
        communityId: string;
        joinedAt: Date;
    }>;
    leaveCommunity(communityId: string, userId: string): Promise<{
        id: string;
        userId: string;
        communityId: string;
        joinedAt: Date;
    }>;
    kickMember(communityId: string, memberUserId: string, requesterId: string, requesterRole: string): Promise<{
        id: string;
        userId: string;
        communityId: string;
        joinedAt: Date;
    }>;
    verifyCommunity(communityId: string, status: CommunityStatus, adminId: string, adminRole: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        description: string;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
    }>;
}
export declare const communityService: CommunityService;
//# sourceMappingURL=community.service.d.ts.map