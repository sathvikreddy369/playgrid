import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  async createReport(req: Request, res: Response) {
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

      const report = await reportService.createReport(req.user.id, {
        targetType,
        targetId,
        reason
      });

      res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const reportController = new ReportController();
