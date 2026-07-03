import prisma from '../utils/db';
import { FraudDetection } from '../utils/fraudDetection';
import { activityService } from './activity.service';
import { AppError } from '../utils/AppError';

export class ReplyService {
  async createReply(userId: string, postId: string, content: string, parentId?: string) {
    if (FraudDetection.containsProfanityOrSpam(content)) {
      throw AppError.badRequest('Content flagged as spam or contains profanity.');
    }
    
    // Ensure post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw AppError.notFound('Post not found');

    if (parentId) {
      // Ensure parent reply exists and belongs to the same post
      const parent = await prisma.reply.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) {
        throw AppError.badRequest('Invalid parent reply');
      }
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId,
      },
    });

    await activityService.logActivity(userId, 'COMMENT_ADDED', reply.id, 'Reply', { postId });

    return reply;
  }

  async deleteReply(replyId: string, userId: string, userRole: string) {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw AppError.notFound('Reply not found');

    if (reply.authorId !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('Unauthorized to delete this reply');
    }

    return prisma.reply.delete({ where: { id: replyId } });
  }

  async toggleLike(replyId: string, userId: string) {
    const existingLike = await prisma.replyLike.findUnique({
      where: { userId_replyId: { userId, replyId } },
    });

    if (existingLike) {
      await prisma.replyLike.delete({ where: { id: existingLike.id } });
      return { liked: false };
    } else {
      await prisma.replyLike.create({ data: { userId, replyId } });
      return { liked: true };
    }
  }
}

export const replyService = new ReplyService();
