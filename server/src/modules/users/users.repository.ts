import { query } from '../../config/db.js';

export interface AddressEntity {
  id: string;
  user_id: string;
  title: string;
  street_address?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: Date;
}

export const usersRepository = {
  async getAddresses(userId: string): Promise<AddressEntity[]> {
    const res = await query<AddressEntity>(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return res.rows;
  },

  async addAddress(userId: string, data: {
    title?: string;
    street_address?: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    is_default?: boolean;
  }): Promise<AddressEntity> {
    if (data.is_default) {
      await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }
    const res = await query<AddressEntity>(
      `INSERT INTO addresses (user_id, title, street_address, locality, city, state, pincode, latitude, longitude, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        data.title || 'Home',
        data.street_address || null,
        data.locality,
        data.city,
        data.state,
        data.pincode,
        data.latitude,
        data.longitude,
        data.is_default ?? false,
      ]
    );
    return res.rows[0];
  },

  async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    const res = await query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [addressId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    await query('UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2', [addressId, userId]);
  },

  async getSellerPublicProfile(sellerId: string) {
    const userRes = await query(
      `SELECT id, name, role, avatar_url, bio, is_verified, rating_avg, rating_count, created_at
       FROM users WHERE id = $1 AND is_suspended = false`,
      [sellerId]
    );
    if (!userRes.rows[0]) return null;

    const seller = userRes.rows[0];

    const statsRes = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_listings,
         COUNT(*) FILTER (WHERE status = 'SOLD') as sold_listings
       FROM listings WHERE seller_id = $1`,
      [sellerId]
    );

    const reviewsRes = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [sellerId]
    );

    return {
      ...seller,
      stats: {
        activeListings: parseInt(statsRes.rows[0]?.active_listings || '0', 10),
        soldListings: parseInt(statsRes.rows[0]?.sold_listings || '0', 10),
      },
      recentReviews: reviewsRes.rows,
    };
  },
};

