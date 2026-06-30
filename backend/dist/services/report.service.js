"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const db_1 = __importDefault(require("../utils/db"));
class ReportService {
    async createReport(submitterId, data) {
        // Validate target exists based on type
        let targetExists = false;
        switch (data.targetType) {
            case 'USER':
                targetExists = (await db_1.default.user.count({ where: { id: data.targetId } })) > 0;
                break;
            case 'POST':
                targetExists = (await db_1.default.post.count({ where: { id: data.targetId } })) > 0;
                break;
            case 'COMMUNITY':
                targetExists = (await db_1.default.community.count({ where: { id: data.targetId } })) > 0;
                break;
            case 'GROUND':
                targetExists = (await db_1.default.ground.count({ where: { id: data.targetId } })) > 0;
                break;
            case 'MESSAGE':
                targetExists = (await db_1.default.message.count({ where: { id: data.targetId } })) > 0;
                break;
        }
        if (!targetExists) {
            throw new Error(`Target ${data.targetType} not found`);
        }
        // Check if user already reported this recently (prevent spam)
        const existing = await db_1.default.report.findFirst({
            where: {
                submitterId,
                targetType: data.targetType,
                targetId: data.targetId,
                status: 'PENDING'
            }
        });
        if (existing) {
            throw new Error('You have already reported this item and it is pending review.');
        }
        return db_1.default.report.create({
            data: {
                submitterId,
                targetType: data.targetType,
                targetId: data.targetId,
                reason: data.reason
            }
        });
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
