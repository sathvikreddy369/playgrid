import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from './db';
import { supabase } from './supabaseClient';
import { User, Profile } from '@prisma/client';

export type UserWithProfile = User & {
  profile?: Profile | null;
};

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: UserWithProfile;
  };
}


export function initializeSocket(httpServer: HttpServer) {
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, ''))
    : ['http://localhost:5173'];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Socket.IO authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const authToken = socket.handshake.auth?.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

      if (authToken?.startsWith('demo-token-')) {
        const isHost = authToken === 'demo-token-host';
        const demoEmail = isHost ? 'demo.host@playgrid.com' : 'demo.player@playgrid.com';
        let user = await prisma.user.findUnique({
          where: { email: demoEmail },
          include: { profile: true }
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              supabaseId: `demo-id-${isHost ? 'host' : 'player'}`,
              email: demoEmail,
              role: isHost ? 'GROUND_OWNER' : 'USER',
              profile: {
                create: {
                  name: isHost ? 'Rahul Verma (Demo Host)' : 'Ananya Sharma (Demo Player)',
                  favoriteSports: ['Cricket', 'Football'],
                  levels: ['Intermediate']
                }
              }
            },
            include: { profile: true }
          });
        }
        socket.data.user = user;
        return next();
      }

      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(authToken);
      if (error || !supabaseUser) {
        return next(new Error('Authentication error: Invalid token'));
      }


      let user = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
        include: { profile: true }
      });

      if (!user) {
        try {
          user = await prisma.user.create({
            data: {
              supabaseId: supabaseUser.id,
              email: supabaseUser.email!
            },
            include: { profile: true }
          });
        } catch (err: any) {
          if (err?.code === 'P2002') {
            user = await prisma.user.findUnique({
              where: { supabaseId: supabaseUser.id },
              include: { profile: true }
            });
          } else {
            throw err;
          }
        }
      }

      if (!user) {
        return next(new Error('Authentication error: User synchronisation failed'));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    console.log(`Authenticated user connected: ${user.id} (${socket.id})`);

    // Join a specific match room with authorization check
    socket.on('join_match_room', async (matchId: string) => {
      try {
        if (!matchId) return;

        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: { requests: true }
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const isHost = match.hostId === user.id;
        const isAcceptedParticipant = match.requests.some(
          r => r.userId === user.id && r.status === 'ACCEPTED'
        );

        if (!isHost && !isAcceptedParticipant) {
          socket.emit('error', { message: 'Unauthorized: Only host and accepted participants can join match chat' });
          return;
        }

        socket.join(matchId);
        console.log(`User ${user.id} joined room: ${matchId}`);
        socket.emit('room_joined', { matchId });
      } catch (err) {
        console.error('Error joining match room:', err);
        socket.emit('error', { message: 'Failed to join match room' });
      }
    });

    // Handle sending a message
    socket.on('send_message', async (data: { matchId: string, text: string }) => {
      try {
        const { matchId, text } = data;

        if (!matchId || !text || !text.trim()) {
          socket.emit('error', { message: 'Invalid message payload' });
          return;
        }

        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: { requests: true }
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const isHost = match.hostId === user.id;
        const isAcceptedParticipant = match.requests.some(
          r => r.userId === user.id && r.status === 'ACCEPTED'
        );

        if (!isHost && !isAcceptedParticipant) {
          socket.emit('error', { message: 'Unauthorized: Only host and accepted participants can send messages' });
          return;
        }

        let senderName = 'Player';
        if (user.profile && user.profile.name) {
          senderName = user.profile.name;
        } else if (user.email) {
          senderName = user.email.split('@')[0] || 'Player';
        }





        // Save to Database with authenticated socket user ID
        const message = await prisma.message.create({
          data: {
            matchId,
            senderId: user.id, // SENDER ID ALWAYS FROM AUTHENTICATED SOCKET SESSION
            text: text.trim(),
            name: senderName
          }
        });

        // Broadcast to everyone in the room, including sender
        io.to(matchId).emit('receive_message', {
          id: message.id,
          matchId,
          senderId: user.id,
          name: senderName,
          text: message.text,
          time: message.createdAt.toISOString()
        });
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id} (${socket.id})`);
    });
  });

  return io;
}


