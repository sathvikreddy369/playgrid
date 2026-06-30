import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // req.body is already validated by Zod middleware
      const { targetType, targetId, reason } = req.body;

      const report = await reportService.createReport(req.user.id, {
        targetType,
        targetId,
        reason
      });

      res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
