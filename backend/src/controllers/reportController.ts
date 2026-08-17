import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db';
import { ReportTargetType } from '@prisma/client';

// POST /api/reports
export const createReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reporterId = req.user!.id;
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ error: 'Target type, target ID, and report reason are required.' });
      return;
    }

    const validTypes: ReportTargetType[] = ['USER', 'OWNER', 'VENUE', 'MATCH', 'REVIEW'];
    if (!validTypes.includes(targetType as ReportTargetType)) {
      res.status(400).json({ error: 'Invalid report target type.' });
      return;
    }

    // Check for duplicate pending report by same reporter on same target
    const existing = await prisma.report.findFirst({
      where: {
        reporterId,
        targetType: targetType as ReportTargetType,
        targetId,
        status: 'PENDING'
      }
    });

    if (existing) {
      res.status(400).json({ error: 'You have already submitted a pending report for this item.' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType: targetType as ReportTargetType,
        targetId,
        reason,
        description: description || '',
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Report submitted successfully. Platform administration will review your report.',
      report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};
