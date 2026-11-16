import { query } from '../../config/db.js';

export interface NotificationEntity {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: Date;
}

export const notificationsRepository = {
  async getByUser(userId: string): Promise<NotificationEntity[]> {
    const res = await query<NotificationEntity>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return res.rows;
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
  },

  async markAllAsRead(userId: string): Promise<void> {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [userId]
    );
  },

  async create(userId: string, title: string, message: string, type: string, link?: string): Promise<NotificationEntity> {
    const res = await query<NotificationEntity>(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, type, link || null]
    );
    return res.rows[0];
  },
};

