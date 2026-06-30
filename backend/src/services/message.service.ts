import prisma from '../utils/db';

export class MessageService {
  async getConversations(userId: string) {
    // Efficient raw query to get the latest message per conversation (H2)
    // We use DISTINCT ON (partner_id) to get exactly one row per conversation partner
    const latestMessages = await prisma.$queryRaw`
      WITH user_messages AS (
        SELECT 
          id, content, "senderId", "receiverId", "createdAt", "isRead",
          CASE WHEN "senderId" = ${userId} THEN "receiverId" ELSE "senderId" END as partner_id
        FROM "Message"
        WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
      ),
      latest_per_partner AS (
        SELECT DISTINCT ON (partner_id) *
        FROM user_messages
        ORDER BY partner_id, "createdAt" DESC
      )
      SELECT * FROM latest_per_partner
      ORDER BY "createdAt" DESC;
    `;

    // Fetch user details for the partners
    const conversations = [];
    for (const msg of (latestMessages as any[])) {
      const partner = await prisma.user.findUnique({
        where: { id: msg.partner_id },
        select: { id: true, name: true, profile: { select: { avatarUrl: true } } }
      });

      // Calculate unread count efficiently
      const unreadCount = await prisma.message.count({
        where: {
          senderId: msg.partner_id,
          receiverId: userId,
          isRead: false
        }
      });

      conversations.push({
        user: partner,
        lastMessage: {
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          createdAt: msg.createdAt,
          isRead: msg.isRead
        },
        unreadCount
      });
    }

    return conversations;
  }

  async getMessagesWithUser(userId: string, otherUserId: string, cursor?: string) {
    const limit = 50;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }, // usually you want 'desc' with cursor, but frontend expects chronological
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    });

    return { messages, nextCursor: messages.length === limit ? messages[messages.length - 1].id : null };
  }

  async markAsRead(userId: string, otherUserId: string) {
    return await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }
}

export const messageService = new MessageService();
