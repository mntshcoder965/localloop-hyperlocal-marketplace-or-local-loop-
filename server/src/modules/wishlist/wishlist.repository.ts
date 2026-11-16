import { query } from '../../config/db.js';

export const wishlistRepository = {
  async add(userId: string, listingId: string): Promise<boolean> {
    const res = await query(
      `INSERT INTO wishlists (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING
       RETURNING id`,
      [userId, listingId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  async remove(userId: string, listingId: string): Promise<boolean> {
    const res = await query(
      'DELETE FROM wishlists WHERE user_id = $1 AND listing_id = $2 RETURNING id',
      [userId, listingId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  async isWishlisted(userId: string, listingId: string): Promise<boolean> {
    const res = await query(
      'SELECT 1 FROM wishlists WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  async getByUser(userId: string) {
    const res = await query(
      `SELECT 
         w.id as wishlist_id, w.created_at as saved_at,
         l.id, l.title, l.description, l.price, l.original_price, l.condition, l.status,
         l.locality, l.city, l.state, l.pincode, l.latitude, l.longitude,
         c.name as category_name, c.slug as category_slug,
         u.id as seller_id, u.name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating_avg,
         (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url, 'is_primary', li.is_primary) ORDER BY li.display_order ASC)
          FROM listing_images li WHERE li.listing_id = l.id) as images
       FROM wishlists w
       JOIN listings l ON l.id = w.listing_id
       JOIN categories c ON c.id = l.category_id
       JOIN users u ON u.id = l.seller_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return res.rows;
  },
};

