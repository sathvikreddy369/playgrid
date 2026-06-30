import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { StructuredLogger } from '../utils/logger';

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getModerationQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await adminService.getModerationQueue();
      res.json(queue);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const users = await adminService.getUsers(page, limit);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const matches = await adminService.getMatches(page, limit);
      res.json(matches);
    } catch (error) {
      next(error);
    }
  }
  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await adminService.getReports();
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { action } = req.body;
      const report = await adminService.resolveReport(id, action);
      
      StructuredLogger.audit('RESOLVE_REPORT', req.user?.id || null, id, 'SUCCESS', req.id, { action });
      
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async toggleBlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await adminService.toggleBlockUser(id);
      
      StructuredLogger.audit('TOGGLE_BLOCK_USER', req.user?.id || null, id, 'SUCCESS', req.id, { isBlocked: user.isBlocked });
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await adminService.deletePost(id);
      
      StructuredLogger.audit('ADMIN_DELETE_POST', req.user?.id || null, id, 'SUCCESS', req.id);
      
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
