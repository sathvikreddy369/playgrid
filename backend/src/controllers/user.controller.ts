import { Request, Response } from 'express';
import prisma from '../utils/db';

export class UserController {
  async getUserProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: id as string },
        include: {
          profile: true,
          badges: { include: { badge: true } },
        }
      });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async getUserPosts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const posts = await prisma.post.findMany({
        where: { authorId: id as string },
        include: {
          author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
          community: { select: { id: true, name: true } },
          _count: { select: { likes: true, replies: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserLikes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const likes = await prisma.postLike.findMany({
        where: { userId: id as string },
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserReplies(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const replies = await prisma.reply.findMany({
        where: { authorId: id as string },
        include: {
          post: { select: { id: true, content: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(replies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserMatches(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { creatorId: id as string },
            { players: { some: { userId: id as string } } }
          ]
        },
        orderBy: { date: 'desc' },
        include: {
          creator: { select: { id: true, name: true } },
          _count: { select: { players: true } }
        }
      });
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const userController = new UserController();
