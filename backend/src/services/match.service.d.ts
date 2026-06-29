export declare class MatchService {
    createMatch(userId: string, data: any): Promise<{
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
    }>;
    getMatches(filters: any): Promise<({
        community: {
            id: string;
            name: string;
        } | null;
        creator: {
            id: string;
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
    getMatchById(id: string): Promise<({
        community: {
            id: string;
            name: string;
        } | null;
        creator: {
            id: string;
            name: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
        players: ({
            user: {
                id: string;
                name: string;
                reputation: number;
                profile: {
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            id: string;
            userId: string;
            status: string;
            joinedAt: Date;
            performanceRating: number | null;
            matchId: string;
        })[];
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
    }) | null>;
    requestToJoin(matchId: string, userId: string): Promise<{
        id: string;
        userId: string;
        status: string;
        joinedAt: Date;
        performanceRating: number | null;
        matchId: string;
    }>;
    handleJoinRequest(matchId: string, creatorId: string, targetUserId: string, action: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        userId: string;
        status: string;
        joinedAt: Date;
        performanceRating: number | null;
        matchId: string;
    }>;
    markAttendance(matchId: string, creatorId: string, targetUserId: string, performanceRating: number): Promise<{
        id: string;
        userId: string;
        status: string;
        joinedAt: Date;
        performanceRating: number | null;
        matchId: string;
    }>;
    cancelMatch(matchId: string, creatorId: string): Promise<{
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
    }>;
}
export declare const matchService: MatchService;
//# sourceMappingURL=match.service.d.ts.map