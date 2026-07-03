import { Request, Response, NextFunction } from 'express';
import { communityService } from '../services/community.service';
import { CommunityStatus, CommunityRole } from '@prisma/client';
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
      const filters = {
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        sport: req.query.sport as string,
        search: req.query.search as string
      };
      const communities = await communityService.getCommunities(filters);
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

  async approveMember(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.id;
      const communityId = req.params.id as string;
      const userId = req.params.userId as string;
      const updated = await communityService.approveMember(communityId, userId, requesterId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async rejectMember(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.id;
      const communityId = req.params.id as string;
      const userId = req.params.userId as string;
      const updated = await communityService.rejectMember(communityId, userId, requesterId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.id;
      const communityId = req.params.id as string;
      const userId = req.params.userId as string;
      const newRole = req.body.role as CommunityRole;
      const updated = await communityService.updateMemberRole(communityId, userId, newRole, requesterId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async kickMember(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.id;
      const requesterSystemRole = req.user!.role;
      const id = (req.params.id as string);
      const userId = (req.params.userId as string);
      
      await communityService.kickMember(id, userId, requesterId, requesterSystemRole);
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

  async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const inviterId = req.user!.id;
      const communityId = req.params.id as string;
      const { targetUserId } = req.body;
      const result = await communityService.inviteUser(communityId, inviterId, targetUserId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const communityController = new CommunityController();
