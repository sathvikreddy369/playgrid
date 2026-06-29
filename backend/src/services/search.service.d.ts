export declare class SearchService {
    globalSearch(query: string, type: string): Promise<any>;
    nearbySearch(lat: number, lng: number, radiusKm: number, type?: 'MATCHES' | 'GROUNDS'): Promise<{
        distance: any;
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
    }[] | {
        distance: any;
        creator: {
            name: string;
        };
        _count: {
            players: number;
        };
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
    }[]>;
    parseQueryWithAI(query: string): Promise<any>;
    applyAIFilters(filters: any): Promise<{
        matches: ({
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
        })[];
        aiFiltersApplied: any;
        error?: never;
    } | {
        error: string;
        aiFiltersApplied: any;
        matches?: never;
    }>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=search.service.d.ts.map