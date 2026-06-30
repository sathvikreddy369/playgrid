import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';

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
      const users = await adminService.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await adminService.getMatches();
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
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async toggleBlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await adminService.toggleBlockUser(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await adminService.deletePost(id);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
