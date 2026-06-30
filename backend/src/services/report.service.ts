import prisma from '../utils/db';
import { ReportType } from '@prisma/client';

export class ReportService {
  async createReport(submitterId: string, data: { targetType: ReportType; targetId: string; reason: string }) {
    // Validate target exists based on type
    let targetExists = false;
    switch (data.targetType) {
      case 'USER':
        targetExists = (await prisma.user.count({ where: { id: data.targetId } })) > 0;
        break;
      case 'POST':
        targetExists = (await prisma.post.count({ where: { id: data.targetId } })) > 0;
        break;
      case 'COMMUNITY':
        targetExists = (await prisma.community.count({ where: { id: data.targetId } })) > 0;
        break;
      case 'GROUND':
        targetExists = (await prisma.ground.count({ where: { id: data.targetId } })) > 0;
        break;
      case 'MESSAGE':
        targetExists = (await prisma.message.count({ where: { id: data.targetId } })) > 0;
        break;
    }

    if (!targetExists) {
      throw new Error(`Target ${data.targetType} not found`);
    }

    // Check if user already reported this recently (prevent spam)
    const existing = await prisma.report.findFirst({
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

    return prisma.report.create({
      data: {
        submitterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason
      }
    });
  }
}

export const reportService = new ReportService();
