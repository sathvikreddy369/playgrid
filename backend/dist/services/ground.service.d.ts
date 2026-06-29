import { GroundStatus } from '@prisma/client';
export declare class GroundService {
    createGround(userId: string, data: any): Promise<{
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
    }>;
    getGrounds(status?: GroundStatus): Promise<({
        _count: {
            reviews: number;
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
    })[]>;
    getGroundById(id: string): Promise<{
        avgRating: string | number;
        _count: {
            reviews: number;
        };
        owner: {
            name: string;
            id: string;
            profile: {
                avatarUrl: string;
            };
        };
        reviews: ({
            user: {
                name: string;
                id: string;
                profile: {
                    avatarUrl: string;
                };
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            groundId: string;
            rating: number;
            comment: string | null;
        })[];
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
    }>;
    updateGround(id: string, userId: string, data: any): Promise<{
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
    }>;
    addReview(groundId: string, userId: string, rating: number, comment?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groundId: string;
        rating: number;
        comment: string | null;
    }>;
    deleteReview(reviewId: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groundId: string;
        rating: number;
        comment: string | null;
    }>;
    verifyGround(id: string, status: GroundStatus, adminRole: string): Promise<{
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
    }>;
    generateAiSummary(id: string): Promise<string>;
}
export declare const groundService: GroundService;
//# sourceMappingURL=ground.service.d.ts.map