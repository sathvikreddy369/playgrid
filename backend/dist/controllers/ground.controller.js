"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groundController = exports.GroundController = void 0;
const ground_service_1 = require("../services/ground.service");
class GroundController {
    async createGround(req, res) {
        try {
            const userId = req.user.id;
            const ground = await ground_service_1.groundService.createGround(userId, req.body);
            res.status(201).json(ground);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getGrounds(req, res) {
        try {
            const status = req.query.status;
            const grounds = await ground_service_1.groundService.getGrounds(status);
            res.json(grounds);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getGroundById(req, res) {
        try {
            const ground = await ground_service_1.groundService.getGroundById(req.params.id);
            if (!ground) {
                return res.status(404).json({ error: 'Ground not found' });
            }
            res.json(ground);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateGround(req, res) {
        try {
            const userId = req.user.id;
            const ground = await ground_service_1.groundService.updateGround(req.params.id, userId, req.body);
            res.json(ground);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async addReview(req, res) {
        try {
            const userId = req.user.id;
            const { rating, comment } = req.body;
            const review = await ground_service_1.groundService.addReview(req.params.id, userId, rating, comment);
            res.status(201).json(review);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteReview(req, res) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            await ground_service_1.groundService.deleteReview(req.params.reviewId, userId, userRole);
            res.json({ message: 'Review deleted' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async verifyGround(req, res) {
        try {
            const adminRole = req.user.role;
            const { status } = req.body;
            const ground = await ground_service_1.groundService.verifyGround(req.params.id, status, adminRole);
            res.json(ground);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.GroundController = GroundController;
exports.groundController = new GroundController();
