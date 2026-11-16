import { query, withTransaction, hasPostGIS } from '../../config/db.js';
import {
  CreateListingDTO,
  ListingEntity,
  ListingFilterQuery,
  UpdateListingDTO,
} from './listings.types.js';

export const listingsRepository = {
  async create(sellerId: string, data: CreateListingDTO): Promise<ListingEntity> {
    return await withTransaction(async (client) => {
      const listingRes = await client.query(
        `INSERT INTO listings (
          seller_id, category_id, title, description, price, original_price,
          condition, status, locality, city, state, pincode, latitude, longitude
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          sellerId,
          data.category_id,
          data.title,
          data.description,
          data.price,
          data.original_price || null,
          data.condition,
          data.status || 'ACTIVE',
          data.locality,
          data.city,
          data.state,
          data.pincode,
          data.latitude,
          data.longitude,
        ]
      );

      const listing = listingRes.rows[0];

      // If PostGIS enabled, populate coordinates geography
      if (hasPostGIS) {
        await client.query(
          `UPDATE listings 
           SET coordinates = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography 
           WHERE id = $3`,
          [data.longitude, data.latitude, listing.id]
        );
      }

      // Insert images
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        await client.query(
          `INSERT INTO listing_images (listing_id, image_url, public_id, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [listing.id, img.url, img.public_id || null, img.is_primary ?? (i === 0), i]
        );
      }

      return listing;
    });
  },

  async update(listingId: string, sellerId: string, data: UpdateListingDTO): Promise<ListingEntity | null> {
    return await withTransaction(async (client) => {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.title !== undefined) {
        fields.push(`title = $${idx++}`);
        values.push(data.title);
      }
      if (data.description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(data.description);
      }
      if (data.category_id !== undefined) {
        fields.push(`category_id = $${idx++}`);
        values.push(data.category_id);
      }
      if (data.price !== undefined) {
        fields.push(`price = $${idx++}`);
        values.push(data.price);
      }
      if (data.original_price !== undefined) {
        fields.push(`original_price = $${idx++}`);
        values.push(data.original_price);
      }
      if (data.condition !== undefined) {
        fields.push(`condition = $${idx++}`);
        values.push(data.condition);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${idx++}`);
        values.push(data.status);
      }
      if (data.locality !== undefined) {
        fields.push(`locality = $${idx++}`);
        values.push(data.locality);
      }
      if (data.city !== undefined) {
        fields.push(`city = $${idx++}`);
        values.push(data.city);
      }
      if (data.state !== undefined) {
        fields.push(`state = $${idx++}`);
        values.push(data.state);
      }
      if (data.pincode !== undefined) {
        fields.push(`pincode = $${idx++}`);
        values.push(data.pincode);
      }
      if (data.latitude !== undefined && data.longitude !== undefined) {
        fields.push(`latitude = $${idx++}`);
        values.push(data.latitude);
        fields.push(`longitude = $${idx++}`);
        values.push(data.longitude);
      }

      if (fields.length > 0) {
        fields.push(`updated_at = NOW()`);
        values.push(listingId);
        values.push(sellerId);

        const updateRes = await client.query(
          `UPDATE listings SET ${fields.join(', ')} WHERE id = $${idx++} AND seller_id = $${idx++} RETURNING *`,
          values
        );

        if (updateRes.rowCount === 0) return null;

        if (hasPostGIS && data.latitude !== undefined && data.longitude !== undefined) {
          await client.query(
            `UPDATE listings SET coordinates = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
            [data.longitude, data.latitude, listingId]
          );
        }
      }

      if (data.images && data.images.length > 0) {
        await client.query('DELETE FROM listing_images WHERE listing_id = $1', [listingId]);
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i];
          await client.query(
            `INSERT INTO listing_images (listing_id, image_url, public_id, is_primary, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [listingId, img.url, img.public_id || null, img.is_primary ?? (i === 0), i]
          );
        }
      }

      return (await this.getById(listingId)) as any;
    });
  },

  async delete(listingId: string, sellerId: string): Promise<boolean> {
    const res = await query(
      `UPDATE listings SET status = 'REMOVED', updated_at = NOW() WHERE id = $1 AND seller_id = $2 RETURNING id`,
      [listingId, sellerId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  async getById(listingId: string, viewerId?: string, viewerLat?: number, viewerLon?: number): Promise<ListingEntity | null> {
    // Increment view count
    await query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [listingId]);

    let distanceSelect = 'NULL as distance_km';
    const params: any[] = [listingId];
    let paramIdx = 2;

    if (viewerLat !== undefined && viewerLon !== undefined) {
      if (hasPostGIS) {
        distanceSelect = `ROUND((ST_Distance(l.coordinates, ST_SetSRID(ST_MakePoint($${paramIdx++}, $${paramIdx++}), 4326)::geography) / 1000)::numeric, 1) as distance_km`;
        params.push(viewerLon, viewerLat);
      } else {
        distanceSelect = `ROUND((6371 * acos(least(1.0, greatest(-1.0, cos(radians($${paramIdx++})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians($${paramIdx++})) + sin(radians($${paramIdx - 2})) * sin(radians(l.latitude))))))::numeric, 1) as distance_km`;
        params.push(viewerLat, viewerLon);
      }
    }

    let wishlistSelect = 'false as is_wishlisted';
    if (viewerId) {
      wishlistSelect = `EXISTS(SELECT 1 FROM wishlists w WHERE w.listing_id = l.id AND w.user_id = $${paramIdx++}) as is_wishlisted`;
      params.push(viewerId);
    }

    const listingRes = await query(
      `SELECT 
         l.id, l.seller_id, l.category_id, l.title, l.description, l.price, l.original_price,
         l.condition, l.status, l.locality, l.city, l.state, l.pincode,
         ROUND(l.latitude, 2) as latitude,
         ROUND(l.longitude, 2) as longitude,
         l.views_count, l.created_at, l.updated_at,
         c.name as category_name, c.slug as category_slug,
         u.name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating_avg, u.rating_count as seller_rating_count,
         ${distanceSelect},
         ${wishlistSelect}
       FROM listings l
       JOIN categories c ON c.id = l.category_id
       JOIN users u ON u.id = l.seller_id
       WHERE l.id = $1`,
      params
    );

    if (!listingRes.rows[0]) return null;

    const listing = listingRes.rows[0];

    const imagesRes = await query(
      'SELECT id, image_url, public_id, is_primary, display_order FROM listing_images WHERE listing_id = $1 ORDER BY display_order ASC',
      [listingId]
    );

    listing.images = imagesRes.rows;
    listing.price = parseFloat(listing.price);
    if (listing.original_price) listing.original_price = parseFloat(listing.original_price);
    if (listing.distance_km !== null) listing.distance_km = parseFloat(listing.distance_km);
    listing.latitude = parseFloat(listing.latitude);
    listing.longitude = parseFloat(listing.longitude);
    listing.seller_rating_avg = parseFloat(listing.seller_rating_avg || '0');
    listing.seller_rating_count = parseInt(listing.seller_rating_count || '0', 10);
    return listing;
  },

  async search(filters: ListingFilterQuery, viewerId?: string): Promise<{ listings: ListingEntity[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["l.status = 'ACTIVE'"];
    const params: any[] = [];
    let idx = 1;

    let distanceSelect = 'NULL as distance_km';
    let distanceClause = '';

    const hasCoords = filters.lat !== undefined && filters.lon !== undefined && !isNaN(filters.lat) && !isNaN(filters.lon);
    const radius = filters.radiusKm || (hasCoords ? 50 : undefined);

    if (hasCoords) {
      if (hasPostGIS) {
        distanceSelect = `ROUND((ST_Distance(l.coordinates, ST_SetSRID(ST_MakePoint($${idx}, $${idx + 1}), 4326)::geography) / 1000)::numeric, 1) as distance_km`;
        if (radius) {
          distanceClause = `ST_DWithin(l.coordinates, ST_SetSRID(ST_MakePoint($${idx}, $${idx + 1}), 4326)::geography, $${idx + 2})`;
          whereClauses.push(distanceClause);
          params.push(filters.lon, filters.lat, radius * 1000);
          idx += 3;
        } else {
          params.push(filters.lon, filters.lat);
          idx += 2;
        }
      } else {
        // Haversine fallback formula
        const latParam = idx++;
        const lonParam = idx++;
        distanceSelect = `ROUND((6371 * acos(least(1.0, greatest(-1.0, cos(radians($${latParam})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians($${lonParam})) + sin(radians($${latParam})) * sin(radians(l.latitude))))))::numeric, 1) as distance_km`;
        params.push(filters.lat, filters.lon);

        if (radius) {
          const radiusParam = idx++;
          params.push(radius);
          whereClauses.push(
            `(6371 * acos(least(1.0, greatest(-1.0, cos(radians($${latParam})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians($${lonParam})) + sin(radians($${latParam})) * sin(radians(l.latitude)))))) <= $${radiusParam}`
          );
        }
      }
    }

    if (filters.q) {
      whereClauses.push(`(l.title ILIKE $${idx} OR l.description ILIKE $${idx} OR l.locality ILIKE $${idx} OR l.city ILIKE $${idx})`);
      params.push(`%${filters.q}%`);
      idx++;
    }

    if (filters.category) {
      whereClauses.push(`c.slug = $${idx}`);
      params.push(filters.category);
      idx++;
    }

    if (filters.condition) {
      const conditions = filters.condition.split(',').map((c) => c.trim());
      whereClauses.push(`l.condition = ANY($${idx})`);
      params.push(conditions);
      idx++;
    }

    if (filters.minPrice !== undefined) {
      whereClauses.push(`l.price >= $${idx}`);
      params.push(filters.minPrice);
      idx++;
    }

    if (filters.maxPrice !== undefined) {
      whereClauses.push(`l.price <= $${idx}`);
      params.push(filters.maxPrice);
      idx++;
    }

    if (filters.pincode && !hasCoords) {
      whereClauses.push(`l.pincode = $${idx}`);
      params.push(filters.pincode);
      idx++;
    }

    let wishlistSelect = 'false as is_wishlisted';
    if (viewerId) {
      wishlistSelect = `EXISTS(SELECT 1 FROM wishlists w WHERE w.listing_id = l.id AND w.user_id = $${idx}) as is_wishlisted`;
      params.push(viewerId);
      idx++;
    }

    // Sorting
    let orderBy = 'l.created_at DESC';
    if (filters.sort === 'price_asc') {
      orderBy = 'l.price ASC';
    } else if (filters.sort === 'price_desc') {
      orderBy = 'l.price DESC';
    } else if (filters.sort === 'nearest' && hasCoords) {
      orderBy = 'distance_km ASC NULLS LAST, l.created_at DESC';
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // const countRes = await query(
    //   `SELECT COUNT(*) FROM listings l JOIN categories c ON c.id = l.category_id ${whereString}`,
    //   params
    // );
    // const total = parseInt(countRes.rows[0]?.count || '0', 10);

    // Count query only needs search filter parameters.
    // It does not need the viewerId used for wishlist status.
    const countParams = viewerId
      ? params.slice(0, -1)
      : params;

    const countRes = await query(
      `SELECT COUNT(*) FROM listings l JOIN categories c ON c.id = l.category_id ${whereString}`,
      countParams
    );

    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const listingsRes = await query(
      `SELECT 
         l.id, l.seller_id, l.category_id, l.title, l.description, l.price, l.original_price,
         l.condition, l.status, l.locality, l.city, l.state, l.pincode,
         ROUND(l.latitude, 2) as latitude,
         ROUND(l.longitude, 2) as longitude,
         l.views_count, l.created_at,
         c.name as category_name, c.slug as category_slug,
         u.name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating_avg, u.rating_count as seller_rating_count,
         ${distanceSelect},
         ${wishlistSelect},
         (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url, 'is_primary', li.is_primary) ORDER BY li.display_order ASC)
          FROM listing_images li WHERE li.listing_id = l.id) as images
       FROM listings l
       JOIN categories c ON c.id = l.category_id
       JOIN users u ON u.id = l.seller_id
       ${whereString}
       ORDER BY ${orderBy}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    const formattedListings = listingsRes.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      original_price: row.original_price ? parseFloat(row.original_price) : undefined,
      distance_km: row.distance_km !== null ? parseFloat(row.distance_km) : undefined,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      seller_rating_avg: parseFloat(row.seller_rating_avg || '0'),
      seller_rating_count: parseInt(row.seller_rating_count || '0', 10),
    }));

    return {
      listings: formattedListings,
      total,
      page,
      limit,
    };
  },

  async getMyListings(sellerId: string, status?: string): Promise<ListingEntity[]> {
    const where = status ? 'WHERE l.seller_id = $1 AND l.status = $2' : 'WHERE l.seller_id = $1';
    const params = status ? [sellerId, status] : [sellerId];

    const res = await query(
      `SELECT 
         l.*,
         c.name as category_name, c.slug as category_slug,
         (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url, 'is_primary', li.is_primary) ORDER BY li.display_order ASC)
          FROM listing_images li WHERE li.listing_id = l.id) as images
       FROM listings l
       JOIN categories c ON c.id = l.category_id
       ${where}
       ORDER BY l.created_at DESC`,
      params
    );
    return res.rows;
  },
};
