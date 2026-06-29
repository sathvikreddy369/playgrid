import { CommunityStatus } from '@prisma/client';
export declare class CommunityService {
    createCommunity(userId: string, data: {
        name: string;
        description: string;
        location?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
        description: string;
    }>;
    getCommunities(status?: CommunityStatus): Promise<({
        owner: {
            id: string;
            name: string;
        };
        _count: {
            members: number;
            matches: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
        description: string;
    })[]>;
    getCommunityById(id: string): Promise<({
        owner: {
            id: string;
            name: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
        members: ({
            user: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                profile: {
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            communityId: string;
        })[];
        _count: {
            members: number;
            matches: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
        description: string;
    }) | null>;
    joinCommunity(communityId: string, userId: string): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        communityId: string;
    }>;
    leaveCommunity(communityId: string, userId: string): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        communityId: string;
    }>;
    kickMember(communityId: string, memberUserId: string, requesterId: string, requesterRole: string): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        communityId: string;
    }>;
    verifyCommunity(communityId: string, status: CommunityStatus, adminId: string, adminRole: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        status: import(".prisma/client").$Enums.CommunityStatus;
        ownerId: string;
        description: string;
    }>;
}
export declare const communityService: CommunityService;
//# sourceMappingURL=community.service.d.ts.map