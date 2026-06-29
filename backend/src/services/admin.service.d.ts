export declare class AdminService {
    getStats(): Promise<{
        totalUsers: number;
        totalMatches: number;
        totalCommunities: number;
        totalGrounds: number;
        activeMatches: number;
        pendingGrounds: number;
        pendingCommunities: number;
    }>;
    getModerationQueue(): Promise<{
        pendingCommunities: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            status: import(".prisma/client").$Enums.CommunityStatus;
            ownerId: string;
            description: string;
        }[];
        pendingGrounds: ({
            owner: {
                email: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            sports: string[];
            latitude: number | null;
            longitude: number | null;
            pricing: string | null;
            amenities: string[];
            photos: string[];
            contactPhone: string | null;
            status: import(".prisma/client").$Enums.GroundStatus;
            ownerId: string;
        })[];
    }>;
    getUsers(): Promise<({
        _count: {
            posts: number;
            matchesCreated: number;
        };
    } & {
        id: string;
        firebaseUid: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        reputation: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getMatches(): Promise<({
        creator: {
            name: string;
        };
        _count: {
            players: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        latitude: number | null;
        longitude: number | null;
        status: import(".prisma/client").$Enums.MatchStatus;
        title: string;
        sport: string;
        date: Date;
        maxPlayers: number;
        costPerPerson: number | null;
        skillLevel: import(".prisma/client").$Enums.MatchSkillLevel;
        creatorId: string;
        communityId: string | null;
    })[]>;
}
export declare const adminService: AdminService;
//# sourceMappingURL=admin.service.d.ts.map