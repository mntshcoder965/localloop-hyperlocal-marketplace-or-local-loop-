import { query } from '../../config/db.js';

export interface ReportEntity {
  id: string;
  reporter_id: string;
  target_type: 'LISTING' | 'USER';
  target_id: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  admin_notes?: string;
  resolved_by?: string;
  created_at: Date;
  updated_at: Date;
}

export const reportsRepository = {
  async create(data: {
    reporterId: string;
    targetType: 'LISTING' | 'USER';
    targetId: string;
    reason: string;
    details?: string;
  }): Promise<ReportEntity> {
    const res = await query<ReportEntity>(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, details, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [data.reporterId, data.targetType, data.targetId, data.reason, data.details || null]
    );
    return res.rows[0];
  },

  async getAll(status?: string): Promise<any[]> {
    const where = status ? 'WHERE r.status = $1' : '';
    const params = status ? [status] : [];

    const res = await query(
      `SELECT r.*,
              u.name as reporter_name, u.email as reporter_email,
              CASE 
                WHEN r.target_type = 'LISTING' THEN (SELECT title FROM listings WHERE id = r.target_id)
                ELSE (SELECT name FROM users WHERE id = r.target_id)
              END as target_title
       FROM reports r
       JOIN users u ON u.id = r.reporter_id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );
    return res.rows;
  },

  async updateResolution(reportId: string, status: string, adminNotes: string, adminId: string): Promise<ReportEntity> {
    const res = await query<ReportEntity>(
      `UPDATE reports
       SET status = $1, admin_notes = $2, resolved_by = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, adminNotes, adminId, reportId]
    );
    return res.rows[0];
  },
};

