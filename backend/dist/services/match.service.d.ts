export declare class MatchService {
    createMatch(userId: string, data: any): Promise<{
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
    }>;
    getMatches(filters: any): Promise<({
        community: {
            name: string;
            id: string;
        };
        _count: {
            players: number;
        };
        creator: {
            name: string;
            id: string;
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
    getMatchById(id: string): Promise<{
        community: {
            name: string;
            id: string;
        };
        creator: {
            name: string;
            id: string;
            profile: {
                avatarUrl: string;
            };
        };
        players: ({
            user: {
                name: string;
                id: string;
                reputation: number;
                profile: {
                    avatarUrl: string;
                };
            };
        } & {
            id: string;
            userId: string;
            status: string;
            joinedAt: Date;
            matchId: string;
            performanceRating: number | null;
        })[];
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
    }>;
    requestToJoin(matchId: string, userId: string): Promise<{
        id: string;
        userId: string;
        status: string;
        joinedAt: Date;
        matchId: string;
        performanceRating: number | null;
    }>;
    handleJoinRequest(matchId: string, creatorId: string, targetUserId: string, action: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        userId: string;
        status: string;
        joinedAt: Date;
        matchId: string;
        performanceRating: number | null;
    }>;
    markAttendance(matchId: string, creatorId: string, targetUserId: string, performanceRating: number): Promise<{
        id: string;
        userId: string;
        status: string;
        joinedAt: Date;
        matchId: string;
        performanceRating: number | null;
    }>;
    cancelMatch(matchId: string, creatorId: string): Promise<{
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
    }>;
}
export declare const matchService: MatchService;
//# sourceMappingURL=match.service.d.ts.map