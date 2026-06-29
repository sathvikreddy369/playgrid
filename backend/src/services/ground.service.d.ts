import { GroundStatus } from '@prisma/client';
export declare class GroundService {
    createGround(userId: string, data: any): Promise<{
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
    }>;
    getGrounds(status?: GroundStatus): Promise<({
        owner: {
            id: string;
            name: string;
        };
        _count: {
            reviews: number;
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
    })[]>;
    getGroundById(id: string): Promise<{
        avgRating: string | number;
        owner: {
            id: string;
            name: string;
            profile: {
                avatarUrl: string | null;
            } | null;
        };
        reviews: ({
            user: {
                id: string;
                name: string;
                profile: {
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            groundId: string;
            rating: number;
            comment: string | null;
        })[];
        _count: {
            reviews: number;
        };
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
    } | null>;
    updateGround(id: string, userId: string, data: any): Promise<{
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
    }>;
    generateAiSummary(id: string): Promise<string | null>;
}
export declare const groundService: GroundService;
//# sourceMappingURL=ground.service.d.ts.map