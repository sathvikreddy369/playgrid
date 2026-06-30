"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
class ReportController {
    async createReport(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { targetType, targetId, reason } = req.body;
            if (!targetType || !targetId || !reason) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            const report = await report_service_1.reportService.createReport(req.user.id, {
                targetType,
                targetId,
                reason
            });
            res.status(201).json({ message: 'Report submitted successfully', report });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
