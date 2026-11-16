import { conversationsRepository } from './conversations.repository.js';
import { listingsRepository } from '../listings/listings.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const conversationsService = {
  async getOrCreate(listingId: string, buyerId: string) {
    const listing = await listingsRepository.getById(listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.seller_id === buyerId) {
      throw new AppError('Cannot start a conversation with yourself as seller', 400);
    }

    return await conversationsRepository.findOrCreate(listingId, buyerId, listing.seller_id);
  },

  async getMyConversations(userId: string) {
    return await conversationsRepository.getUserConversations(userId);
  },

  async getMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
    const convo = await conversationsRepository.getById(conversationId);
    if (!convo) {
      throw new AppError('Conversation not found', 404);
    }

    if (convo.buyer_id !== userId && convo.seller_id !== userId) {
      throw new AppError('Forbidden: You are not a participant in this conversation', 403);
    }

    // Auto mark as read
    await conversationsRepository.markAsRead(conversationId, userId);

    const messages = await conversationsRepository.getMessages(conversationId, limit, offset);
    return {
      conversation: convo,
      messages,
    };
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const convo = await conversationsRepository.getById(conversationId);
    if (!convo) {
      throw new AppError('Conversation not found', 404);
    }

    if (convo.buyer_id !== senderId && convo.seller_id !== senderId) {
      throw new AppError('Forbidden: You cannot send messages in this conversation', 403);
    }

    const message = await conversationsRepository.saveMessage(conversationId, senderId, content.trim());
    const recipientId = convo.buyer_id === senderId ? convo.seller_id : convo.buyer_id;

    return {
      message,
      recipientId,
    };
  },

  async markAsRead(conversationId: string, userId: string) {
    const convo = await conversationsRepository.getById(conversationId);
    if (!convo) return;
    if (convo.buyer_id !== userId && convo.seller_id !== userId) return;
    await conversationsRepository.markAsRead(conversationId, userId);
  },
};

