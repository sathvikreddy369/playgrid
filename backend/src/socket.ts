import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from './db';

export function initializeSocket(httpServer: HttpServer) {
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173'];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific match room
    socket.on('join_match_room', (matchId: string) => {
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined room: ${matchId}`);
    });

    // Handle sending a message
    socket.on('send_message', async (data: { matchId: string, senderId: string, text: string, name: string, time: string }) => {
      try {
        // Save to Database
        const message = await prisma.message.create({
          data: {
            matchId: data.matchId,
            senderId: data.senderId,
            text: data.text,
            name: data.name
          }
        });

        // Broadcast to everyone in the room, including sender
        io.to(data.matchId).emit('receive_message', { ...data, id: message.id });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

