import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getAuth } from './utils/firebase';
import prisma from './utils/db';
import { censorText } from './utils/badWords';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  // Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const auth = getAuth();
      if (!auth) {
        return next(new Error('Authentication error: Firebase Auth not initialized'));
      }

      // Verify token
      const decodedToken = await auth.verifyIdToken(token);
      
      // Find user in DB to attach ID
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found in database'));
      }

      // Attach user ID to socket
      (socket as any).userId = user.id;
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected to socket: ${userId} (${socket.id})`);

    // Join personal room for private messages
    socket.join(`user_${userId}`);

    socket.on('typing', ({ to }: { to: string }) => {
      // Forward typing event to recipient
      io.to(`user_${to}`).emit('typing', { from: userId });
    });

    socket.on('stop_typing', ({ to }: { to: string }) => {
      io.to(`user_${to}`).emit('stop_typing', { from: userId });
    });

    socket.on('mark_read', async ({ from }: { from: string }) => {
      try {
        // Update DB
        await prisma.message.updateMany({
          where: { senderId: from, receiverId: userId, isRead: false },
          data: { isRead: true }
        });
        
        // Notify sender that their messages were read
        io.to(`user_${from}`).emit('messages_read', { by: userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('send_message', async ({ to, content }: { to: string; content: string }) => {
      try {
        const censoredContent = censorText(content);
        
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: to,
            content: censoredContent
          },
          include: {
            sender: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } }
          }
        });

        // Emit to receiver
        io.to(`user_${to}`).emit('receive_message', message);
        // Also emit back to sender to confirm it was sent
        socket.emit('message_sent', message);

        // Optionally send a REST-based notification if user is offline, but real-time is handled here
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${userId}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
