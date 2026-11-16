import { query } from '../../config/db.js';

export interface ConversationEntity {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: Date;
  created_at: Date;
}

export interface MessageEntity {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

export const conversationsRepository = {
  async findOrCreate(listingId: string, buyerId: string, sellerId: string): Promise<ConversationEntity> {
    const existing = await query<ConversationEntity>(
      'SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3',
      [listingId, buyerId, sellerId]
    );

    if (existing.rows[0]) {
      return existing.rows[0];
    }

    const inserted = await query<ConversationEntity>(
      `INSERT INTO conversations (listing_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (listing_id, buyer_id, seller_id) DO UPDATE SET last_message_at = NOW()
       RETURNING *`,
      [listingId, buyerId, sellerId]
    );

    return inserted.rows[0];
  },

  async getById(id: string): Promise<ConversationEntity | null> {
    const res = await query<ConversationEntity>('SELECT * FROM conversations WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async getUserConversations(userId: string) {
    const res = await query(
      `SELECT 
         c.id, c.listing_id, c.buyer_id, c.seller_id, c.last_message_at, c.created_at,
         l.title as listing_title, l.price as listing_price, l.status as listing_status,
         (SELECT li.image_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC, li.display_order ASC LIMIT 1) as listing_image,
         CASE 
           WHEN c.buyer_id = $1 THEN seller.name 
           ELSE buyer.name 
         END as other_user_name,
         CASE 
           WHEN c.buyer_id = $1 THEN seller.avatar_url 
           ELSE buyer.avatar_url 
         END as other_user_avatar,
         CASE 
           WHEN c.buyer_id = $1 THEN seller.id 
           ELSE buyer.id 
         END as other_user_id,
         (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
         (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.is_read = false)::int as unread_count
       FROM conversations c
       JOIN listings l ON l.id = c.listing_id
       JOIN users buyer ON buyer.id = c.buyer_id
       JOIN users seller ON seller.id = c.seller_id
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY c.last_message_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<MessageEntity[]> {
    const res = await query<MessageEntity>(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return res.rows;
  },

  async saveMessage(conversationId: string, senderId: string, content: string): Promise<MessageEntity> {
    const res = await query<MessageEntity>(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, senderId, content]
    );

    // Update conversation last_message_at
    await query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]);

    return res.rows[0];
  },

  async markAsRead(conversationId: string, viewerId: string): Promise<void> {
    await query(
      `UPDATE messages 
       SET is_read = true, read_at = NOW() 
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [conversationId, viewerId]
    );
  },
};

