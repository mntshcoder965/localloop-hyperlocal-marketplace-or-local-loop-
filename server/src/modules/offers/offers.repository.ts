import { query } from '../../config/db.js';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'WITHDRAWN';

export interface OfferEntity {
  id: string;
  conversation_id?: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: OfferStatus;
  counter_amount?: number;
  message?: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  listing_title?: string;
  listing_price?: number;
  buyer_name?: string;
  seller_name?: string;
}

export const offersRepository = {
  async create(data: {
    conversationId?: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    message?: string;
  }): Promise<OfferEntity> {
    const res = await query<OfferEntity>(
      `INSERT INTO offers (conversation_id, listing_id, buyer_id, seller_id, amount, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [data.conversationId || null, data.listingId, data.buyerId, data.sellerId, data.amount, data.message || null]
    );
    return res.rows[0];
  },

  async getById(id: string): Promise<OfferEntity | null> {
    const res = await query<OfferEntity>(
      `SELECT o.*, l.title as listing_title, l.price as listing_price,
              b.name as buyer_name, s.name as seller_name
       FROM offers o
       JOIN listings l ON l.id = o.listing_id
       JOIN users b ON b.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       WHERE o.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async getByListing(listingId: string): Promise<OfferEntity[]> {
    const res = await query<OfferEntity>(
      `SELECT o.*, b.name as buyer_name, b.avatar_url as buyer_avatar
       FROM offers o
       JOIN users b ON b.id = o.buyer_id
       WHERE o.listing_id = $1
       ORDER BY o.created_at DESC`,
      [listingId]
    );
    return res.rows;
  },

  async getByUser(userId: string, role: 'BUYER' | 'SELLER'): Promise<OfferEntity[]> {
    const where = role === 'BUYER' ? 'o.buyer_id = $1' : 'o.seller_id = $1';
    const res = await query<OfferEntity>(
      `SELECT o.*, l.title as listing_title, l.price as listing_price,
              (SELECT li.image_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC LIMIT 1) as listing_image,
              b.name as buyer_name, s.name as seller_name
       FROM offers o
       JOIN listings l ON l.id = o.listing_id
       JOIN users b ON b.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       WHERE ${where}
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async updateStatus(id: string, status: OfferStatus, counterAmount?: number): Promise<OfferEntity> {
    const fields = ['status = $1', 'updated_at = NOW()'];
    const values: any[] = [status];
    let idx = 2;

    if (counterAmount !== undefined) {
      fields.push(`counter_amount = $${idx++}`);
      values.push(counterAmount);
    }

    values.push(id);
    const res = await query<OfferEntity>(
      `UPDATE offers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },
};

