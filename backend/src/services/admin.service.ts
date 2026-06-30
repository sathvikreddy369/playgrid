import prisma from '../utils/db';
import { ReportStatus } from '@prisma/client';

export class AdminService {
  async getStats() {
    const totalUsers = await prisma.user.count();
    const totalMatches = await prisma.match.count();
    const totalCommunities = await prisma.community.count();
    const totalGrounds = await prisma.ground.count();
    const activeMatches = await prisma.match.count({ where: { status: 'OPEN' } });
    const pendingGrounds = await prisma.ground.count({ where: { status: 'PENDING' } });
    const pendingCommunities = await prisma.community.count({ where: { status: 'PENDING' } });
    
    return {
      totalUsers,
      totalMatches,
      totalCommunities,
      totalGrounds,
      activeMatches,
      pendingGrounds,
      pendingCommunities
    };
  }

  async getModerationQueue() {
    const pendingCommunities = await prisma.community.findMany({
      where: { status: 'PENDING' },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    
    const pendingGrounds = await prisma.ground.findMany({
      where: { status: 'PENDING' },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    
    return {
      pendingCommunities,
      pendingGrounds
    };
  }

  async getUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { posts: true, matchesCreated: true } }
      }
    });
  }

  async getMatches(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        creator: { select: { name: true } },
        _count: { select: { players: true } }
      }
    });
  }

  async getReports() {
    // Fetch pending reports
    return prisma.report.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        submitter: { select: { name: true, email: true } }
      }
    });
  }

  async resolveReport(id: string, action: ReportStatus) {
    return prisma.report.update({
      where: { id },
      data: { status: action }
    });
  }

  async toggleBlockUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    
    return prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked }
    });
  }

  async deletePost(id: string) {
    return prisma.post.delete({
      where: { id }
    });
  }
}

export const adminService = new AdminService();
