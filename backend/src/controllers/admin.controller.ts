import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

export class AdminController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getModerationQueue(req: Request, res: Response) {
    try {
      const queue = await adminService.getModerationQueue();
      res.json(queue);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await adminService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMatches(req: Request, res: Response) {
    try {
      const matches = await adminService.getMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async getReports(req: Request, res: Response) {
    try {
      const reports = await adminService.getReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async resolveReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'ACTION_TAKEN' or 'DISMISSED'
      const report = await adminService.resolveReport(id as string, action);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async toggleBlockUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await adminService.toggleBlockUser(id as string);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await adminService.deletePost(id as string);
      res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const adminController = new AdminController();
