import prisma from '../utils/db';
import { FraudDetection } from '../utils/fraudDetection';

export class ReplyService {
  async createReply(userId: string, postId: string, content: string, parentId?: string) {
    if (FraudDetection.containsProfanityOrSpam(content)) {
      throw new Error('Content flagged as spam or contains profanity.');
    }
    
    // Ensure post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    if (parentId) {
      // Ensure parent reply exists and belongs to the same post
      const parent = await prisma.reply.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) {
        throw new Error('Invalid parent reply');
      }
    }

    return prisma.reply.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId,
      },
    });
  }

  async deleteReply(replyId: string, userId: string, userRole: string) {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');

    if (reply.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Unauthorized to delete this reply');
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
