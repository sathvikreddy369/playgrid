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
}

export const userController = new UserController();
