import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../utils/AppError';

export class UserController {
  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          badges: { include: { badge: true } },
          _count: {
            select: {
              matchParticipations: { where: { status: 'ATTENDED' } },
              matchesCreated: { where: { status: 'COMPLETED' } },
              communitiesOwned: true,
              communityMemberships: true,
            }
          },
          reviewsReceived: {
            include: { reviewer: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });
      if (!user) {
        throw AppError.notFound('User not found');
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
  async getUserPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const posts = await prisma.post.findMany({
        where: { authorId: id },
        include: {
          author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
          community: { select: { id: true, name: true } },
          _count: { select: { likes: true, replies: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  async getUserLikes(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const likes = await prisma.postLike.findMany({
        where: { userId: id },
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
              community: { select: { id: true, name: true } },
              _count: { select: { likes: true, replies: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(likes.map(like => like.post));
    } catch (error) {
      next(error);
    }
  }

  async getUserReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const replies = await prisma.reply.findMany({
        where: { authorId: id },
        include: {
          post: { select: { id: true, content: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(replies);
    } catch (error) {
      next(error);
    }
  }

  async getUserMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { creatorId: id },
            { players: { some: { userId: id } } }
          ]
        },
        orderBy: { date: 'desc' },
        include: {
          creator: { select: { id: true, name: true } },
          _count: { select: { players: true } }
        }
      });
      res.json(matches);
    } catch (error) {
      next(error);
    }
  }

  async getUserActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { limit, offset } = req.query;
      const { activityService } = await import('../services/activity.service');
      
      const activities = await activityService.getUserActivities(
        id,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );
      res.json(activities);
    } catch (error) {
      next(error);
    }
  }

  async addUserReview(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.id;
      const targetId = req.params.id as string;
      const { rating, comment } = req.body;

      if (reviewerId === targetId) {
        throw AppError.badRequest('You cannot review yourself');
      }

      // Check if they have played a match together
      const sharedMatches = await prisma.matchPlayer.findFirst({
        where: {
          userId: reviewerId,
          status: 'ATTENDED',
          match: {
            players: {
              some: {
                userId: targetId,
                status: 'ATTENDED'
              }
            }
          }
        }
      });

      const hostedShared = await prisma.match.findFirst({
        where: {
          creatorId: targetId,
          status: 'COMPLETED',
          players: {
            some: {
              userId: reviewerId,
              status: 'ATTENDED'
            }
          }
        }
      });
      
      const guestShared = await prisma.match.findFirst({
        where: {
          creatorId: reviewerId,
          status: 'COMPLETED',
          players: {
            some: {
              userId: targetId,
              status: 'ATTENDED'
            }
          }
        }
      });

      if (!sharedMatches && !hostedShared && !guestShared) {
        throw AppError.badRequest('You can only review users you have played with');
      }

      const review = await prisma.userReview.upsert({
        where: { reviewerId_targetId: { reviewerId, targetId } },
        update: { rating, comment },
        create: { reviewerId, targetId, rating, comment }
      });

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async connectUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.id;
      const recipientId = req.params.id as string;

      if (requesterId === recipientId) {
        throw AppError.badRequest('You cannot connect with yourself');
      }

      const connection = await prisma.userConnection.upsert({
        where: { requesterId_recipientId: { requesterId, recipientId } },
        update: { status: 'PENDING' },
        create: { requesterId, recipientId, status: 'PENDING' }
      });

      res.status(201).json(connection);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
