"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const firebase_1 = require("./utils/firebase");
const db_1 = __importDefault(require("./utils/db"));
const badWords_1 = require("./utils/badWords");
let io;
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST']
        }
    });
    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }
            const auth = (0, firebase_1.getAuth)();
            if (!auth) {
                return next(new Error('Authentication error: Firebase Auth not initialized'));
            }
            // Verify token
            const decodedToken = await auth.verifyIdToken(token);
            // Find user in DB to attach ID
            const user = await db_1.default.user.findUnique({
                where: { firebaseUid: decodedToken.uid }
            });
            if (!user) {
                return next(new Error('Authentication error: User not found in database'));
            }
            // Attach user ID to socket
            socket.userId = user.id;
            next();
        }
        catch (error) {
            console.error('Socket authentication failed:', error);
            next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User connected to socket: ${userId} (${socket.id})`);
        // Join personal room for private messages
        socket.join(`user_${userId}`);
        socket.on('typing', ({ to }) => {
            // Forward typing event to recipient
            io.to(`user_${to}`).emit('typing', { from: userId });
        });
        socket.on('stop_typing', ({ to }) => {
            io.to(`user_${to}`).emit('stop_typing', { from: userId });
        });
        socket.on('mark_read', async ({ from }) => {
            try {
                // Update DB
                await db_1.default.message.updateMany({
                    where: { senderId: from, receiverId: userId, isRead: false },
                    data: { isRead: true }
                });
                // Notify sender that their messages were read
                io.to(`user_${from}`).emit('messages_read', { by: userId });
            }
            catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });
        socket.on('send_message', async ({ to, content }) => {
            try {
                const censoredContent = (0, badWords_1.censorText)(content);
                const message = await db_1.default.message.create({
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
            }
            catch (error) {
                console.error('Error sending message:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected from socket: ${userId}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIo = getIo;
//# sourceMappingURL=socket.js.map