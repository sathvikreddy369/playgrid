"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groundService = exports.GroundService = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
const ai_service_1 = require("./ai.service");
class GroundService {
    async createGround(userId, data) {
        return db_1.default.ground.create({
            data: {
                name: data.name,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                pricing: data.pricing,
                amenities: data.amenities || [],
                sports: data.sports || [],
                photos: data.photos || [],
                contactPhone: data.contactPhone,
                status: client_1.GroundStatus.PENDING,
                ownerId: userId,
            },
        });
    }
    async getGrounds(status) {
        return db_1.default.ground.findMany({
            where: status ? { status } : { status: client_1.GroundStatus.VERIFIED },
            include: {
                owner: { select: { id: true, name: true } },
                _count: { select: { reviews: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getGroundById(id) {
        const ground = await db_1.default.ground.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
                reviews: {
                    include: {
                        user: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: { select: { reviews: true } }
            }
        });
        if (!ground)
            return null;
        // Calculate average rating
        const totalRating = ground.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = ground.reviews.length > 0 ? (totalRating / ground.reviews.length).toFixed(1) : 0;
        return { ...ground, avgRating };
    }
    async updateGround(id, userId, data) {
        const ground = await db_1.default.ground.findUnique({ where: { id } });
        if (!ground)
            throw new Error('Ground not found');
        if (ground.ownerId !== userId)
            throw new Error('Unauthorized');
        return db_1.default.ground.update({
            where: { id },
            data,
        });
    }
    async addReview(groundId, userId, rating, comment) {
        if (rating < 1 || rating > 5)
            throw new Error('Rating must be between 1 and 5');
        // Upsert to handle the unique constraint (one review per user per ground)
        const review = await db_1.default.groundReview.upsert({
            where: { groundId_userId: { groundId, userId } },
            update: { rating, comment },
            create: { groundId, userId, rating, comment }
        });
        // Fire and forget AI summary generation
        this.generateAiSummary(groundId).catch(err => console.error('Failed to generate AI summary:', err));
        return review;
    }
    async deleteReview(reviewId, userId, userRole) {
        const review = await db_1.default.groundReview.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new Error('Review not found');
        if (review.userId !== userId && userRole !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return db_1.default.groundReview.delete({ where: { id: reviewId } });
    }
    async verifyGround(id, status, adminRole) {
        if (adminRole !== 'ADMIN')
            throw new Error('Unauthorized');
        return db_1.default.ground.update({
            where: { id },
            data: { status }
        });
    }
    async generateAiSummary(id) {
        const ground = await db_1.default.ground.findUnique({
            where: { id },
            include: { reviews: { select: { comment: true } } }
        });
        if (!ground)
            throw new Error('Ground not found');
        const reviewTexts = ground.reviews
            .map(r => r.comment)
            .filter(c => c !== null);
        if (reviewTexts.length === 0)
            return null;
        const summary = await ai_service_1.aiService.summarizeReviews(reviewTexts);
        await db_1.default.ground.update({
            where: { id },
            data: { aiSummary: summary }
        });
        return summary;
    }
}
exports.GroundService = GroundService;
exports.groundService = new GroundService();
//# sourceMappingURL=ground.service.js.map