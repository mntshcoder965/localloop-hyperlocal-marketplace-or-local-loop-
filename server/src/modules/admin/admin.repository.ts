import { query } from '../../config/db.js';

export const adminRepository = {
  async getDashboardStats() {
    const usersCountRes = await query('SELECT COUNT(*) FROM users');
    const activeListingsRes = await query("SELECT COUNT(*) FROM listings WHERE status = 'ACTIVE'");
    const completedOrdersRes = await query("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_volume FROM orders WHERE status = 'COMPLETED' OR status = 'PAYMENT_CONFIRMED'");
    const pendingReportsRes = await query("SELECT COUNT(*) FROM reports WHERE status = 'PENDING'");

    const recentListings = await query(
      `SELECT l.id, l.title, l.price, l.status, l.created_at, u.name as seller_name
       FROM listings l
       JOIN users u ON u.id = l.seller_id
       ORDER BY l.created_at DESC LIMIT 5`
    );

    const recentOrders = await query(
      `SELECT o.id, o.amount, o.status, o.transaction_type, o.created_at,
              b.name as buyer_name, s.name as seller_name, l.title as listing_title
       FROM orders o
       JOIN users b ON b.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       JOIN listings l ON l.id = o.listing_id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    return {
      totalUsers: parseInt(usersCountRes.rows[0]?.count || '0', 10),
      activeListings: parseInt(activeListingsRes.rows[0]?.count || '0', 10),
      completedOrders: parseInt(completedOrdersRes.rows[0]?.count || '0', 10),
      totalVolume: parseFloat(completedOrdersRes.rows[0]?.total_volume || '0'),
      pendingReports: parseInt(pendingReportsRes.rows[0]?.count || '0', 10),
      recentListings: recentListings.rows,
      recentOrders: recentOrders.rows,
    };
  },

  async getUsers(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;
    const where = search ? 'WHERE name ILIKE $1 OR email ILIKE $1' : '';
    const params = search ? [`%${search}%`, limit, offset] : [limit, offset];
    const limitIdx = search ? 2 : 1;
    const offsetIdx = search ? 3 : 2;

    const usersRes = await query(
      `SELECT id, name, email, role, phone, is_verified, is_suspended, rating_avg, rating_count, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );

    const countRes = await query(`SELECT COUNT(*) FROM users ${where}`, search ? [`%${search}%`] : []);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    return {
      users: usersRes.rows,
      total,
      page,
      limit,
    };
  },

  async toggleUserSuspension(userId: string, isSuspended: boolean) {
    const res = await query(
      'UPDATE users SET is_suspended = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, is_suspended',
      [isSuspended, userId]
    );
    return res.rows[0];
  },

  async moderateListing(listingId: string, status: 'ACTIVE' | 'REMOVED') {
    const res = await query(
      'UPDATE listings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, status',
      [status, listingId]
    );
    return res.rows[0];
  },
};

