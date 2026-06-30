import { Request, Response, NextFunction } from 'express';
import { communityService } from '../services/community.service';
import { CommunityStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { StructuredLogger } from '../utils/logger';

export class CommunityController {
  async createCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const community = await communityService.createCommunity(userId, req.body);
      
      StructuredLogger.audit('CREATE_COMMUNITY', userId, community.id, 'SUCCESS', req.id);
      
      res.status(201).json(community);
    } catch (error) {
      next(error);
    }
  }

  async getCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as CommunityStatus;
      const communities = await communityService.getCommunities(status);
      res.json(communities);
    } catch (error) {
      next(error);
    }
  }

  async getCommunityById(req: Request, res: Response, next: NextFunction) {
    try {
      const community = await communityService.getCommunityById((req.params.id as string));
      if (!community) {
        throw AppError.notFound('Community not found');
      }
      res.json(community);
    } catch (error) {
      next(error);
    }
  }

  async joinCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const member = await communityService.joinCommunity((req.params.id as string), userId);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  async leaveCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await communityService.leaveCommunity((req.params.id as string), userId);
      res.json({ message: 'Left community' });
    } catch (error) {
      next(error);
    }
  }

  async kickMember(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.id;
      const requesterRole = req.user!.role;
      const id = (req.params.id as string);
      const userId = (req.params.userId as string);
      
      await communityService.kickMember(id, userId, requesterId, requesterRole);
      res.json({ message: 'Member removed' });
    } catch (error) {
      next(error);
    }
  }

  async verifyCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const adminRole = req.user!.role;
      const { status } = req.body;
      const communityId = req.params.id as string;
      
      const community = await communityService.verifyCommunity(communityId, status, adminId, adminRole);
      
      StructuredLogger.audit('VERIFY_COMMUNITY', adminId, communityId, 'SUCCESS', req.id, { status });
      
      res.json(community);
    } catch (error) {
      next(error);
    }
  }
}

export const communityController = new CommunityController();
