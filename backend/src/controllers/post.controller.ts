import { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';
import { replyService } from '../services/reply.service';
import { AppError } from '../utils/AppError';
import { StructuredLogger } from '../utils/logger';

export class PostController {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, communityId, authorId, cursor, limit } = req.query;
      const result = await postService.getPosts(
        { 
          type: type as string, 
          communityId: communityId as string,
          authorId: authorId as string 
        }, 
        cursor as string,
        limit ? parseInt(limit as string) : 10
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const post = await postService.getPostById((req.params.id as string), userId);
      if (!post) {
        throw AppError.notFound('Post not found');
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const post = await postService.createPost(userId, req.body);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { content } = req.body;
      const post = await postService.updatePost((req.params.id as string), userId, content);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const postId = req.params.id as string;
      await postService.deletePost(postId, userId, role);
      
      StructuredLogger.audit('DELETE_POST', userId, postId, 'SUCCESS', req.id);
      
      res.json({ message: 'Post deleted' });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await postService.toggleLike((req.params.id as string), userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleSave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await postService.toggleSave((req.params.id as string), userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // --- REPLIES ---

  async createReply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { content, parentId } = req.body;
      const reply = await replyService.createReply(userId, (req.params.id as string), content, parentId);
      res.status(201).json(reply);
    } catch (error) {
      next(error);
    }
  }

  async toggleReplyLike(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await replyService.toggleLike((req.params.id as string), userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteReply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      await replyService.deleteReply((req.params.id as string), userId, role);
      res.json({ message: 'Reply deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
