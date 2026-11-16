import { query, withTransaction } from '../../config/db.js';

export interface ReviewEntity {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
}

export const reviewsRepository = {
  async createReview(data: {
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
  }): Promise<ReviewEntity> {
    return await withTransaction(async (client) => {
      const res = await client.query<ReviewEntity>(
        `INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.orderId, data.reviewerId, data.revieweeId, data.rating, data.comment || null]
      );

      // Recalculate seller rating average and count
      await client.query(
        `UPDATE users
         SET rating_avg = (SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM reviews WHERE reviewee_id = $1),
             rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1)
         WHERE id = $1`,
        [data.revieweeId]
      );

      return res.rows[0];
    });
  },

  async hasReviewed(orderId: string, reviewerId: string): Promise<boolean> {
    const res = await query(
      'SELECT 1 FROM reviews WHERE order_id = $1 AND reviewer_id = $2',
      [orderId, reviewerId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  async getSellerReviews(sellerId: string): Promise<ReviewEntity[]> {
    const res = await query<ReviewEntity>(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [sellerId]
    );
    return res.rows;
  },
};

