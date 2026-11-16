import { query, withTransaction } from '../../config/db.js';

export type TransactionType = 'ONLINE' | 'OFFLINE';
export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'MEETUP_SCHEDULED'
  | 'MEETUP_CONFIRMED_BUYER'
  | 'MEETUP_CONFIRMED_SELLER'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderEntity {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offer_id?: string;
  amount: number;
  transaction_type: TransactionType;
  status: OrderStatus;
  meetup_location?: string;
  meetup_time?: Date;
  meetup_notes?: string;
  buyer_confirmed: boolean;
  seller_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  listing_title?: string;
  listing_image?: string;
  buyer_name?: string;
  seller_name?: string;
}

export const ordersRepository = {
  async createWithLock(data: {
    listingId: string;
    buyerId: string;
    offerId?: string;
    transactionType: TransactionType;
    meetupLocation?: string;
    meetupTime?: Date;
    meetupNotes?: string;
  }): Promise<OrderEntity> {
    return await withTransaction(async (client) => {
      // 1. Row-level lock on listing to strictly prevent concurrent double purchases
      const listingRes = await client.query(
        'SELECT id, status, seller_id, price FROM listings WHERE id = $1 FOR UPDATE',
        [data.listingId]
      );

      const listing = listingRes.rows[0];
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'ACTIVE') {
        throw new Error('Listing is no longer active and available for purchase');
      }

      if (listing.seller_id === data.buyerId) {
        throw new Error('You cannot purchase your own listed product');
      }

      // Check offer if provided
      let finalAmount = parseFloat(listing.price);
      if (data.offerId) {
        const offerRes = await client.query(
          'SELECT amount, status, buyer_id FROM offers WHERE id = $1',
          [data.offerId]
        );
        const offer = offerRes.rows[0];
        if (offer && offer.status === 'ACCEPTED' && offer.buyer_id === data.buyerId) {
          finalAmount = parseFloat(offer.amount);
        }
      }

      // 2. Reserve listing
      await client.query("UPDATE listings SET status = 'RESERVED', updated_at = NOW() WHERE id = $1", [
        data.listingId,
      ]);

      const initialStatus: OrderStatus =
        data.transactionType === 'ONLINE' ? 'PENDING' : 'MEETUP_SCHEDULED';

      // 3. Insert order
      const orderRes = await client.query<OrderEntity>(
        `INSERT INTO orders (
          listing_id, buyer_id, seller_id, offer_id, amount,
          transaction_type, status, meetup_location, meetup_time, meetup_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          data.listingId,
          data.buyerId,
          listing.seller_id,
          data.offerId || null,
          finalAmount,
          data.transactionType,
          initialStatus,
          data.meetupLocation || null,
          data.meetupTime || null,
          data.meetupNotes || null,
        ]
      );

      return orderRes.rows[0];
    });
  },

  async getById(orderId: string): Promise<OrderEntity | null> {
    const res = await query<OrderEntity>(
      `SELECT o.*, l.title as listing_title,
              (SELECT li.image_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC LIMIT 1) as listing_image,
              b.name as buyer_name, s.name as seller_name
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users b ON b.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       WHERE o.id = $1`,
      [orderId]
    );
    return res.rows[0] || null;
  },

  async getUserOrders(userId: string, role: 'BUYER' | 'SELLER'): Promise<OrderEntity[]> {
    const where = role === 'BUYER' ? 'o.buyer_id = $1' : 'o.seller_id = $1';
    const res = await query<OrderEntity>(
      `SELECT o.*, l.title as listing_title,
              (SELECT li.image_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC LIMIT 1) as listing_image,
              b.name as buyer_name, s.name as seller_name
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users b ON b.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       WHERE ${where}
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderEntity> {
    const res = await query<OrderEntity>(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    return res.rows[0];
  },

  async confirmMeetupHandshake(
    orderId: string,
    role: 'BUYER' | 'SELLER'
  ): Promise<{ order: OrderEntity; isCompleted: boolean }> {
    return await withTransaction(async (client) => {
      const field = role === 'BUYER' ? 'buyer_confirmed' : 'seller_confirmed';
      const interimStatus = role === 'BUYER' ? 'MEETUP_CONFIRMED_BUYER' : 'MEETUP_CONFIRMED_SELLER';

      const updateRes = await client.query<OrderEntity>(
        `UPDATE orders 
         SET ${field} = true,
             status = CASE 
               WHEN (buyer_confirmed = true OR '${role}' = 'BUYER') AND (seller_confirmed = true OR '${role}' = 'SELLER') THEN 'COMPLETED'
               ELSE '${interimStatus}'
             END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [orderId]
      );

      const updated = updateRes.rows[0];
      const isCompleted = updated.status === 'COMPLETED';

      // When fully completed, mark listing SOLD
      if (isCompleted) {
        await client.query("UPDATE listings SET status = 'SOLD', updated_at = NOW() WHERE id = $1", [
          updated.listing_id,
        ]);
      }

      return { order: updated, isCompleted };
    });
  },

  async cancelOrder(orderId: string): Promise<OrderEntity> {
    return await withTransaction(async (client) => {
      const orderRes = await client.query<OrderEntity>(
        "UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1 RETURNING *",
        [orderId]
      );
      const order = orderRes.rows[0];

      // Release listing back to ACTIVE
      await client.query("UPDATE listings SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1", [
        order.listing_id,
      ]);

      return order;
    });
  },
};

