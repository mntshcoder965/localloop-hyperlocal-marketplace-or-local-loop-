import { query } from '../../config/db.js';

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
}

export const categoriesRepository = {
  async getAll(): Promise<CategoryEntity[]> {
    const res = await query<CategoryEntity>(
      'SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC, name ASC'
    );
    return res.rows;
  },

  async getBySlug(slug: string): Promise<CategoryEntity | null> {
    const res = await query<CategoryEntity>(
      'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
      [slug]
    );
    return res.rows[0] || null;
  },
};

