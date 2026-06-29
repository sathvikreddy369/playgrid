import { Request, Response } from 'express';
import { communityService } from '../services/community.service';
import { CommunityStatus } from '@prisma/client';

export class CommunityController {
  async createCommunity(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      // Per instructions, any user can apply for a community/organizer role.
      // So we allow any logged-in user to create a community (which starts PENDING).
      const community = await communityService.createCommunity(userId, req.body);
      res.status(201).json(community);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCommunities(req: Request, res: Response) {
    try {
      const status = req.query.status as CommunityStatus;
      const communities = await communityService.getCommunities(status);
      res.json(communities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCommunityById(req: Request, res: Response) {
    try {
      const community = await communityService.getCommunityById((req.params.id as string));
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      res.json(community);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async joinCommunity(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const member = await communityService.joinCommunity((req.params.id as string), userId);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async leaveCommunity(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      await communityService.leaveCommunity((req.params.id as string), userId);
      res.json({ message: 'Left community' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async kickMember(req: Request, res: Response) {
    try {
      const requesterId = req.user!.id;
      const requesterRole = req.user!.role;
      const id = req.params.id as string;
      const userId = req.params.userId as string;
      
      await communityService.kickMember(id, userId, requesterId, requesterRole);
      res.json({ message: 'Member removed' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyCommunity(req: Request, res: Response) {
    try {
      const adminId = req.user!.id;
      const adminRole = req.user!.role;
      const { status } = req.body;
      
      const community = await communityService.verifyCommunity((req.params.id as string), status, adminId, adminRole);
      res.json(community);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const communityController = new CommunityController();
