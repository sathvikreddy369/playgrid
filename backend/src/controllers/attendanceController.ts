import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMatchAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const attendances = await prisma.attendance.findMany({
      where: { matchId },
      include: {
        user: { include: { profile: true } }
      }
    });

    res.json({ attendances });
  } catch (error) {
    console.error('Error fetching match attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const matchId = req.params.matchId as string;
    const { attendanceRecords } = req.body; // Array of { userId: string, status: 'ATTENDED' | 'MISSED' }

    if (!Array.isArray(attendanceRecords)) {
      return res.status(400).json({ error: 'Invalid attendance records payload' });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the match host can mark attendance' });
    }

    // Process attendance updates transactionally
    await prisma.$transaction(async (tx) => {
      for (const record of attendanceRecords) {
        const { userId, status } = record;
        if (status !== 'ATTENDED' && status !== 'MISSED') continue;

        // Upsert attendance record
        await tx.attendance.upsert({
          where: { matchId_userId: { matchId, userId } },
          update: { status, markedAt: new Date() },
          create: { matchId, userId, status, markedAt: new Date() }
        });

        // Recalculate player reliability stats
        const userAttendances = await tx.attendance.findMany({
          where: { userId }
        });

        const attendedCount = userAttendances.filter(a => a.status === 'ATTENDED').length;
        const missedCount = userAttendances.filter(a => a.status === 'MISSED').length;
        const total = attendedCount + missedCount;

        const hostedCount = await tx.match.count({ where: { hostId: userId, status: 'COMPLETED' } });

        let reliabilityScore = 100;
        if (total > 0) {
          const ratio = attendedCount / total;
          reliabilityScore = Math.min(100, Math.max(0, Math.round(ratio * 80 + Math.min(20, hostedCount * 5))));
        }

        await tx.profile.updateMany({
          where: { userId },
          data: {
            attendedGames: attendedCount,
            missedGames: missedCount,
            hostedGames: hostedCount,
            reliabilityScore
          }
        });
      }

      // Mark match as COMPLETED if not already
      if (match.status !== 'COMPLETED') {
        await tx.match.update({
          where: { id: matchId },
          data: { status: 'COMPLETED' }
        });
      }
    });

    res.json({ message: 'Attendance marked successfully and player scores updated' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
