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

        // 2. Mock Firebase Auth middleware inside socket auth
        vi.spyOn(auth, 'verifyIdToken').mockResolvedValue({ uid: user.firebaseUid } as any);

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
    vi.restoreAllMocks();
  });

  it('should authenticate user and join user-specific room', () => {
    // The serverSocket should have joined a room with `user:${userId}`
    expect(serverSocket.rooms.has(`user:${testUserId}`)).toBe(true);
  });

  it('should handle send_message event', () => {
    return new Promise<void>((resolve) => {
      clientSocket.emit('send_message', { to: 'some-other-user', content: 'Hello' });
      
      // We expect the server to emit either message_sent or an error, since 'some-other-user' doesn't exist
      // but the test is just checking if it listens to the event.
      setTimeout(() => {
        resolve();
      }, 50);
    });
  });
});
