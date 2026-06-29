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
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map