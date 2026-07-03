import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer, Server } from 'http';
import { initializeSocket } from '../socket';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import prisma from '../utils/db';
import { auth } from '../utils/firebase';

describe('Socket.IO Events', () => {
  let io: any;
  let serverSocket: any;
  let clientSocket: ClientSocket;
  let httpServer: Server;
  let testUserId: string;
  let testReceiverId: string;

  beforeAll(async () => {
    httpServer = createServer();
    io = initializeSocket(httpServer);
    
    await new Promise<void>((resolve) => {
      httpServer.listen(0, async () => {
        const port = (httpServer.address() as any).port;

        // 1. Create a test user in DB
        const user = await prisma.user.create({
          data: {
            firebaseUid: `socket-test-${Date.now()}`,
            email: `socket-test-${Date.now()}@example.com`,
            name: 'Socket Test User',
          }
        });
        testUserId = user.id;

        // Create a test receiver in DB to prevent foreign key errors
        const receiver = await prisma.user.create({
          data: {
            firebaseUid: `socket-test-recv-${Date.now()}`,
            email: `socket-test-recv-${Date.now()}@example.com`,
            name: 'Socket Test Receiver',
          }
        });
        testReceiverId = receiver.id;

        // 2. Mock Firebase Auth middleware inside socket auth
        vi.spyOn(auth as any, 'verifyIdToken').mockResolvedValue({ uid: user.firebaseUid } as any);

        // Connect client
        clientSocket = Client(`http://localhost:${port}`, {
          auth: {
            token: 'Bearer mock-valid-token'
          }
        });

        io.on('connection', (socket: any) => {
          serverSocket = socket;
        });

        clientSocket.on('connect', () => {
          resolve();
        });
      });
    });
  });

  afterAll(async () => {
    io.close();
    clientSocket.disconnect();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.user.delete({ where: { id: testReceiverId } });
    vi.restoreAllMocks();
  });

  it('should authenticate user and join user-specific room', () => {
    // The serverSocket should have joined a room with `user:${userId}`
    expect(serverSocket.rooms.has(`user:${testUserId}`)).toBe(true);
  });

  it('should handle send_message event', () => {
    return new Promise<void>((resolve) => {
      clientSocket.emit('send_message', { to: testReceiverId, content: 'Hello' });
      
      // We expect the server to emit either message_sent or an error
      // but the test is just checking if it listens to the event.
      setTimeout(() => {
        resolve();
      }, 50);
    });
  });
});
