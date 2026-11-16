import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { conversationsService } from '../modules/conversations/conversations.service.js';
import { conversationsRepository } from '../modules/conversations/conversations.repository.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function setupSocketIO(io: Server) {
  // Authentication middleware for socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.split(' ')[1]
          : null);

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const payload = verifyAccessToken(token);
      socket.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch (err: any) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    logger.info(`[Socket] User connected: ${user.email} (${socket.id})`);

    // Join personal notification channel
    socket.join(`user:${user.id}`);

    // Join conversation room
    socket.on('joinConversation', async (conversationId: string) => {
      try {
        const convo = await conversationsRepository.getById(conversationId);
        if (convo && (convo.buyer_id === user.id || convo.seller_id === user.id)) {
          socket.join(`conversation:${conversationId}`);
          logger.debug(`[Socket] User ${user.email} joined conversation:${conversationId}`);
        }
      } catch (err) {
        logger.error(`[Socket] Error joining conversation:`, err);
      }
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Real-time message sending
    socket.on('sendMessage', async (data: { conversationId: string; content: string }) => {
      try {
        if (!data.content || !data.content.trim()) return;

        const result = await conversationsService.sendMessage(
          data.conversationId,
          user.id,
          data.content
        );

        // Broadcast to conversation room
        io.to(`conversation:${data.conversationId}`).emit('newMessage', {
          ...result.message,
          sender_id: user.id,
        });

        // Notify recipient if they aren't looking at the conversation
        io.to(`user:${result.recipientId}`).emit('newNotification', {
          type: 'CHAT_MESSAGE',
          conversationId: data.conversationId,
          senderId: user.id,
          text: data.content.slice(0, 50),
          createdAt: new Date(),
        });
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('userTyping', {
        conversationId: data.conversationId,
        userId: user.id,
      });
    });

    socket.on('stopTyping', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('userStopTyping', {
        conversationId: data.conversationId,
        userId: user.id,
      });
    });

    // Read receipts
    socket.on('markRead', async (data: { conversationId: string }) => {
      try {
        await conversationsService.markAsRead(data.conversationId, user.id);
        socket.to(`conversation:${data.conversationId}`).emit('messagesRead', {
          conversationId: data.conversationId,
          readerId: user.id,
        });
      } catch (err) {
        // Silently catch
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] User disconnected: ${user.email} (${socket.id})`);
    });
  });
}

