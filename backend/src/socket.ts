import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { auth } from './utils/firebase';
import prisma from './utils/db';

let io: SocketIOServer;

const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');

export const initializeSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
  });

  // Authentication middleware — verify Firebase token on every connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      let decodedToken;
      if (!auth) {
        if (process.env.NODE_ENV === 'production') {
          return next(new Error('Authentication required: Firebase not initialized'));
        }
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        decodedToken = { uid: payload.user_id || payload.sub };
      } else {
        decodedToken = await auth.verifyIdToken(token);
      }
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user) {
        return next(new Error('User not found in database'));
      }

      if (user.isBlocked) {
        return next(new Error('Account is blocked'));
      }

      // Attach user info to socket
      socket.data.userId = user.id;
      socket.data.firebaseUid = decodedToken.uid;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;

    // Join a personal room for targeted messaging
    socket.join(`user:${userId}`);
    
    // Update presence
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true, lastActive: new Date() }
      });
      // Broadcast to all (or just friends, but for simplicity broadcast globally)
      io.emit('presence_update', { userId, isOnline: true, lastActive: new Date() });
    } catch (e) {
      console.error('Failed to update presence on connect', e);
    }

    // Handle sending messages
    socket.on('send_message', async (data: { to: string; content: string }) => {
      try {
        if (!data.to || !data.content?.trim()) return;

        // Ensure content is not excessively long
        const content = data.content.trim().slice(0, 2000);

        // Save message to database
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: data.to,
            content,
          },
          include: {
            sender: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
          },
        });

        // Emit to receiver
        io.to(`user:${data.to}`).emit('receive_message', message);

        // Confirm to sender
        socket.emit('message_sent', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', (data: { to: string }) => {
      io.to(`user:${data.to}`).emit('typing', { from: userId });
    });

    socket.on('stop_typing', (data: { to: string }) => {
      io.to(`user:${data.to}`).emit('stop_typing', { from: userId });
    });

    // Mark messages as read
    socket.on('mark_read', async (data: { from: string }) => {
      try {
        await prisma.message.updateMany({
          where: {
            senderId: data.from,
            receiverId: userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        io.to(`user:${data.from}`).emit('messages_read', { by: userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Match Rooms
    socket.on('join_match', (data: { matchId: string }) => {
      if (data.matchId) {
        socket.join(`match:${data.matchId}`);
      }
    });

    socket.on('leave_match', (data: { matchId: string }) => {
      if (data.matchId) {
        socket.leave(`match:${data.matchId}`);
      }
    });
    
    // Community Rooms
    socket.on('join_community', (data: { communityId: string }) => {
      if (data.communityId) {
        socket.join(`community:${data.communityId}`);
      }
    });

    socket.on('leave_community', (data: { communityId: string }) => {
      if (data.communityId) {
        socket.leave(`community:${data.communityId}`);
      }
    });

    socket.on('disconnect', async () => {
      // Handle disconnected user
      try {
        const lastActive = new Date();
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastActive }
        });
        io.emit('presence_update', { userId, isOnline: false, lastActive });
      } catch (e) {
        console.error('Failed to update presence on disconnect', e);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
