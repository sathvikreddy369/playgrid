import prisma from '../utils/db';

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

    // In a real app we'd also pull flagged posts/reports here
    return {
      pendingCommunities,
      pendingGrounds
    };
  }

  async getUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // MVP limit
      include: {
        _count: { select: { posts: true, matchesCreated: true } }
      }
    });
  }

  async getMatches() {
    return prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        creator: { select: { name: true } },
        _count: { select: { players: true } }
      }
    });
  }
}

export const adminService = new AdminService();
