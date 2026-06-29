import { Request, Response } from 'express';
import { postService } from '../services/post.service';
import { replyService } from '../services/reply.service';

export class PostController {
  async getPosts(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const post = await postService.getPostById(req.params.id, userId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const post = await postService.createPost(userId, req.body);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { content } = req.body;
      const post = await postService.updatePost(req.params.id, userId, content);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      await postService.deletePost(req.params.id, userId, role);
      res.json({ message: 'Post deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleLike(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await postService.toggleLike(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleSave(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await postService.toggleSave(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // --- REPLIES ---

  async createReply(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { content, parentId } = req.body;
      const reply = await replyService.createReply(userId, req.params.id, content, parentId);
      res.status(201).json(reply);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleReplyLike(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await replyService.toggleLike(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReply(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      await replyService.deleteReply(req.params.id, userId, role);
      res.json({ message: 'Reply deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const postController = new PostController();
