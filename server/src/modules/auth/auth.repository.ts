import { query } from '../../config/db.js';
import { UserEntity } from './auth.types.js';

export const authRepository = {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const res = await query<UserEntity>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return res.rows[0] || null;
  },

  async findById(id: string): Promise<UserEntity | null> {
    const res = await query<UserEntity>('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async createUser(data: {
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
    role: string;
  }): Promise<UserEntity> {
    const res = await query<UserEntity>(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, LOWER($2), $3, $4, $5)
       RETURNING *`,
      [data.name, data.email, data.password_hash, data.phone || null, data.role]
    );
    return res.rows[0];
  },

  async updateProfile(id: string, data: { name?: string; phone?: string; avatar_url?: string; bio?: string }): Promise<UserEntity> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(data.avatar_url);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(data.bio);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const res = await query<UserEntity>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async updatePassword(id: string, password_hash: string): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, id]
    );
  },

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findRefreshToken(tokenHash: string): Promise<any | null> {
    const res = await query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()`,
      [tokenHash]
    );
    return res.rows[0] || null;
  },

  async revokeRefreshToken(tokenHash: string, replacedBy?: string): Promise<void> {
    await query(
      `UPDATE refresh_tokens SET revoked = true, replaced_by_token = $1 WHERE token_hash = $2`,
      [replacedBy || null, tokenHash]
    );
  },

  async revokeAllUserTokens(userId: string): Promise<void> {
    await query(`UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`, [userId]);
  },
};

