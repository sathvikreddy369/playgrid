import prisma from '../utils/db';
import { PostType } from '@prisma/client';
import { FraudDetection } from '../utils/fraudDetection';
import { aiService } from './ai.service';
import { activityService } from './activity.service';
import { getIO } from '../socket';

export class PostService {
  async getPosts(filters: { type?: string; location?: string; communityId?: string; authorId?: string }, cursor?: string, limit: number = 10) {
    const where: any = {};
    if (filters.type) where.type = filters.type as PostType;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters.communityId) where.communityId = filters.communityId;
    if (filters.authorId) where.authorId = filters.authorId;

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatarUrl: true } } },
        },
        _count: {
          select: { replies: true, likes: true },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop(); // Remove the extra item
      nextCursor = nextItem?.id;
    }

    return { posts, nextCursor };
  }

  async getPostById(postId: string, userId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        replies: {
          take: 50, // Limit nested replies for performance
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
            _count: { select: { likes: true, replies: true } },
          },
        },
        _count: { select: { likes: true, replies: true } },
        // If logged in, check if user liked/saved this post
        ...(userId && {
          likes: { where: { userId } },
          savedBy: { where: { userId } },
        }),
      },
    });
    return post;
  }

  async createPost(userId: string, data: { content: string; type?: PostType; location?: string; latitude?: number; longitude?: number; tags?: string[]; communityId?: string }) {
    if (FraudDetection.containsProfanityOrSpam(data.content)) {
      throw new Error('Content flagged as spam or contains profanity.');
    }

    const aiModeration = await aiService.moderateContent(data.content);
    if (!aiModeration.isSafe) {
      throw new Error(`Content flagged by AI moderation: ${aiModeration.reason}`);
    }

    if (await FraudDetection.isDuplicatePost(userId, data.content)) {
      throw new Error('Duplicate post detected. Please wait before posting again.');
    }

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: data.content,
        type: data.type || PostType.GENERAL,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        tags: data.tags || [],
        communityId: data.communityId,
      },
    });

    await activityService.logActivity(userId, 'POST_CREATED', post.id, 'Post', { type: post.type });

    if (data.communityId) {
      try {
        const io = getIO();
        io.to(`community:${data.communityId}`).emit('new_community_post', post);
      } catch (err) {
        // socket might not be initialized in some test envs
        console.error('Failed to emit socket event', err);
      }
    }

    return post;
  }

  async updatePost(postId: string, userId: string, content: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Unauthorized');

    if (FraudDetection.containsProfanityOrSpam(content)) {
      throw new Error('Content flagged as spam or contains profanity.');
    }

    return prisma.post.update({
      where: { id: postId },
      data: { content, isEdited: true },
    });
  }

  async deletePost(postId: string, userId: string, userRole: string) {
    const post = await prisma.post.findUnique({ 
      where: { id: postId },
      include: { community: true }
    });
    if (!post) throw new Error('Post not found');

    const isAuthor = post.authorId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isCommunityOwner = post.community?.ownerId === userId;

    if (!isAuthor && !isAdmin && !isCommunityOwner) {
      throw new Error('Unauthorized to delete this post');
    }

    return prisma.post.delete({ where: { id: postId } });
  }

  async toggleLike(postId: string, userId: string) {
    const existingLike = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
      return { liked: false };
    } else {
      await prisma.postLike.create({ data: { userId, postId } });
      return { liked: true };
    }
  }

  async toggleSave(postId: string, userId: string) {
    const existingSave = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingSave) {
      await prisma.savedPost.delete({ where: { id: existingSave.id } });
      return { saved: false };
    } else {
      await prisma.savedPost.create({ data: { userId, postId } });
      return { saved: true };
    }
  }
}

export const postService = new PostService();
