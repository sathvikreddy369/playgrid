export declare class SearchService {
    globalSearch(query: string, type: string): Promise<any>;
    nearbySearch(lat: number, lng: number, radiusKm: number, type?: 'MATCHES' | 'GROUNDS'): Promise<{
        distance: any;
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
    }[] | {
        distance: any;
        _count: {
            players: number;
        };
        creator: {
            name: string;
        };
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
    }[]>;
    parseQueryWithAI(query: string): Promise<any>;
    applyAIFilters(filters: any): Promise<{
        matches: ({
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
        })[];
        aiFiltersApplied: any;
        error?: undefined;
    } | {
        error: string;
        aiFiltersApplied: any;
        matches?: undefined;
    }>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=search.service.d.ts.map