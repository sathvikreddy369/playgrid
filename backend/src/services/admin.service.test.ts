import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './admin.service';
import prisma from '../utils/db';

vi.mock('../utils/db', () => {
  return {
    default: {
      user: {
        findMany: vi.fn(),
      },
      match: {
        findMany: vi.fn(),
      },
    },
  };
});

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pagination Implementation', () => {
    it('should calculate skip and take correctly for getUsers', async () => {
      (prisma.user.findMany as any).mockResolvedValue([]);

      await adminService.getUsers(2, 20);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should calculate skip and take correctly for getMatches', async () => {
      (prisma.match.findMany as any).mockResolvedValue([]);

      await adminService.getMatches(3, 15);

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 30,
          take: 15,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should use default pagination values if not provided', async () => {
      (prisma.user.findMany as any).mockResolvedValue([]);

      await adminService.getUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        })
      );
    });
  });
});
