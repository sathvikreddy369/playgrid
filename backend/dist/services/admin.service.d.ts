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
        pendingCommunities: ({
            owner: {
                name: string;
                email: string;
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
        })[];
        pendingGrounds: ({
            owner: {
                name: string;
                email: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            sports: string[];
            status: import(".prisma/client").$Enums.GroundStatus;
            ownerId: string;
            latitude: number | null;
            longitude: number | null;
            pricing: string | null;
            amenities: string[];
            photos: string[];
            contactPhone: string | null;
            aiSummary: string | null;
        })[];
    }>;
    getUsers(): Promise<({
        _count: {
            posts: number;
            matchesCreated: number;
        };
    } & {
        name: string;
        id: string;
        firebaseUid: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        reputation: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getMatches(): Promise<({
        _count: {
            players: number;
        };
        creator: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        communityId: string | null;
        title: string;
        sport: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        latitude: number | null;
        longitude: number | null;
        date: Date;
        maxPlayers: number;
        costPerPerson: number | null;
        skillLevel: import(".prisma/client").$Enums.MatchSkillLevel;
        creatorId: string;
    })[]>;
}
export declare const adminService: AdminService;
//# sourceMappingURL=admin.service.d.ts.map