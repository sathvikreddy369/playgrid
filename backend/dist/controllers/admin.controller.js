"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
class AdminController {
    async getStats(req, res) {
        try {
            const stats = await admin_service_1.adminService.getStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getModerationQueue(req, res) {
        try {
            const queue = await admin_service_1.adminService.getModerationQueue();
            res.json(queue);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getUsers(req, res) {
        try {
            const users = await admin_service_1.adminService.getUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getMatches(req, res) {
        try {
            const matches = await admin_service_1.adminService.getMatches();
            res.json(matches);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getReports(req, res) {
        try {
            const reports = await admin_service_1.adminService.getReports();
            res.json(reports);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async resolveReport(req, res) {
        try {
            const { id } = req.params;
            const { action } = req.body; // 'ACTION_TAKEN' or 'DISMISSED'
            const report = await admin_service_1.adminService.resolveReport(id, action);
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async toggleBlockUser(req, res) {
        try {
            const { id } = req.params;
            const user = await admin_service_1.adminService.toggleBlockUser(id);
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async deletePost(req, res) {
        try {
            const { id } = req.params;
            await admin_service_1.adminService.deletePost(id);
            res.json({ message: 'Post deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
