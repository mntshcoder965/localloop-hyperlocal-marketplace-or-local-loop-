import bcrypt from 'bcrypt';
import { pool, checkPostGIS } from '../config/db.js';

export async function seedDatabase() {
  console.log('[Seed] Seeding database with realistic categories, users, and listings...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Categories
    const categories = [
      { name: 'Electronics', slug: 'electronics', icon: 'Tv', description: 'Gadgets, audio, TVs and consumer electronics', order: 1 },
      { name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone', description: 'Smartphones, tablets and accessories', order: 2 },
      { name: 'Laptops', slug: 'laptops', icon: 'Laptop', description: 'Laptops, desktops, monitors and PC parts', order: 3 },
      { name: 'Furniture', slug: 'furniture', icon: 'Armchair', description: 'Chairs, desks, tables, sofas and home decor', order: 4 },
      { name: 'Books', slug: 'books', icon: 'BookOpen', description: 'Fiction, non-fiction, textbooks and e-readers', order: 5 },
      { name: 'Fashion', slug: 'fashion', icon: 'Shirt', description: 'Clothing, watches, shoes and luxury accessories', order: 6 },
      { name: 'Home Appliances', slug: 'home-appliances', icon: 'Refrigerator', description: 'Refrigerators, microwaves, washing machines', order: 7 },
      { name: 'Sports Equipment', slug: 'sports-equipment', icon: 'Dumbbell', description: 'Bicycles, gym gear, rackets and fitness kits', order: 8 },
      { name: 'Vehicles', slug: 'vehicles', icon: 'Car', description: 'Two-wheelers, cars, and vehicle accessories', order: 9 },
      { name: 'Other', slug: 'other', icon: 'Package', description: 'Miscellaneous items and collectibles', order: 10 },
    ];

    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, icon, description, display_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.icon, cat.description, cat.order]
      );
      categoryMap.set(res.rows[0].slug, res.rows[0].id);
    }
    console.log(`[Seed] Seeded ${categoryMap.size} categories.`);

    // 2. Users
    const hashedPassword = await bcrypt.hash('MarketPass123!', 10);
    const users = [
      {
        name: 'LocalLoop Admin',
        email: 'admin@localloop.market',
        role: 'ADMIN',
        phone: '+919876543210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'LocalLoop Platform Operations Administrator.',
        rating_avg: 5.0,
        rating_count: 12,
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.seller@gmail.com',
        role: 'SELLER',
        phone: '+919811223344',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Tech enthusiast & software engineer in Indiranagar. Fast responder, verified seller.',
        rating_avg: 4.85,
        rating_count: 24,
      },
      {
        name: 'Priya Venkatesh',
        email: 'priya.tech@gmail.com',
        role: 'SELLER',
        phone: '+919822334455',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        bio: 'UI designer living in Koramangala. Selling well-maintained workstation gadgets & electronics.',
        rating_avg: 4.92,
        rating_count: 18,
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun.buyer@gmail.com',
        role: 'BUYER',
        phone: '+919833445566',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        bio: 'Student at St. Josephs. Frequent buyer of used tech and textbooks.',
        rating_avg: 4.70,
        rating_count: 5,
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.deals@gmail.com',
        role: 'BUYER',
        phone: '+919844556677',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        bio: 'HSR Layout resident looking for home and sports gear.',
        rating_avg: 5.0,
        rating_count: 8,
      },
    ];

    const userMap = new Map<string, string>();
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, phone, avatar_url, bio, is_verified, rating_avg, rating_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, bio = EXCLUDED.bio
         RETURNING id, email`,
        [u.name, u.email, hashedPassword, u.role, u.phone, u.avatar, u.bio, u.rating_avg, u.rating_count]
      );
      userMap.set(res.rows[0].email, res.rows[0].id);
    }
    console.log(`[Seed] Seeded ${userMap.size} users.`);

    // 3. User Addresses
    const rahulId = userMap.get('rahul.seller@gmail.com')!;
    const priyaId = userMap.get('priya.tech@gmail.com')!;
    const arjunId = userMap.get('arjun.buyer@gmail.com')!;

    const addresses = [
      { userId: rahulId, title: 'Apartment', street: '12th Main, HAL 2nd Stage', locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', lat: 12.9719, lon: 77.6412 },
      { userId: priyaId, title: 'Studio', street: '4th Block, 80 Feet Road', locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', lat: 12.9352, lon: 77.6245 },
      { userId: arjunId, title: 'Hostel', street: 'Residency Road', locality: 'Shanthi Nagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560025', lat: 12.9667, lon: 77.5983 },
    ];

    for (const addr of addresses) {
      await client.query(
        `INSERT INTO addresses (user_id, title, street_address, locality, city, state, pincode, latitude, longitude, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
         ON CONFLICT DO NOTHING`,
        [addr.userId, addr.title, addr.street, addr.locality, addr.city, addr.state, addr.pincode, addr.lat, addr.lon]
      );
    }

    // 4. Sample Realistic Listings (Hyperlocal to Bengaluru tech corridor)
    const listings = [
      {
        sellerEmail: 'rahul.seller@gmail.com',
        categorySlug: 'laptops',
        title: 'MacBook Pro 14-inch M2 (16GB RAM / 512GB SSD) Space Grey',
        description: 'Apple M2 Pro chip, pristine condition with 96% battery health and original 67W MagSafe fast charger. Comes with original box and bill. Kept in a hard-shell case throughout. In-person testing welcome.',
        price: 92000,
        original_price: 169900,
        condition: 'LIKE_NEW',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        lat: 12.9719,
        lon: 77.6412,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'priya.tech@gmail.com',
        categorySlug: 'electronics',
        title: 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones',
        description: 'Class-leading ANC headphones in Midnight Black. 30-hour battery life, touch controls, and case included. Sparingly used during flight travels. Clean ear cushions.',
        price: 14500,
        original_price: 24990,
        condition: 'LIKE_NEW',
        locality: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        lat: 12.9352,
        lon: 77.6245,
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'rahul.seller@gmail.com',
        categorySlug: 'mobiles',
        title: 'iPhone 14 Pro 128GB Deep Purple - Under AppleCare+',
        description: 'No scratches or dents, tempered glass applied since day one. 89% battery health. Comes with 2 Spigen cases, braided lightning cable, and original box.',
        price: 64000,
        original_price: 119900,
        condition: 'LIKE_NEW',
        locality: 'HSR Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560102',
        lat: 12.9121,
        lon: 77.6446,
        images: [
          'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'priya.tech@gmail.com',
        categorySlug: 'furniture',
        title: 'Ergonomic Mesh Office Chair (Green Soul Monster Series)',
        description: 'Breathable korean mesh, 3D adjustable armrests, heavy-duty metal base and multi-lock synchro tilt. Perfect for work-from-home setups. Pick up only.',
        price: 5200,
        original_price: 13990,
        condition: 'GOOD',
        locality: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        lat: 12.9352,
        lon: 77.6245,
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3f25c7e148e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'rahul.seller@gmail.com',
        categorySlug: 'sports-equipment',
        title: 'Decathlon Rockrider ST 100 Mountain Bike (27.5 inch)',
        description: '21-speed Shimano Tourney gears, front suspension fork, lightweight aluminum frame. Serviced last month at Decathlon Whitefield. Free helmet and combination lock included.',
        price: 9500,
        original_price: 15999,
        condition: 'GOOD',
        locality: 'Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        lat: 12.9260,
        lon: 77.6762,
        images: [
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'priya.tech@gmail.com',
        categorySlug: 'books',
        title: 'Amazon Kindle Paperwhite (11th Gen, 6.8" Screen, 8GB)',
        description: 'Warm light adjustment, 10-week battery life, waterproof IPX8. Screen is completely scratch-free. Includes blue magnetic sleep/wake cover.',
        price: 8200,
        original_price: 13999,
        condition: 'LIKE_NEW',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        lat: 12.9719,
        lon: 77.6412,
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'rahul.seller@gmail.com',
        categorySlug: 'home-appliances',
        title: 'LG 260 Litres Smart Inverter Double Door Refrigerator',
        description: '3-star energy rating, shiny steel finish, frost-free operation with multi-air flow cooling. Working flawlessly, selling due to relocation.',
        price: 13500,
        original_price: 26990,
        condition: 'GOOD',
        locality: 'Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        lat: 12.9698,
        lon: 77.7499,
        images: [
          'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        sellerEmail: 'priya.tech@gmail.com',
        categorySlug: 'electronics',
        title: 'Fujifilm X-T30 Mirrorless Camera + 18-55mm f/2.8-4 OIS Lens',
        description: '26.1MP X-Trans sensor, 4K video recording, iconic retro silver design. Shutter count under 4,200. Comes with 2 original batteries, dual charger, and 64GB Extreme Pro SD card.',
        price: 54000,
        original_price: 94999,
        condition: 'LIKE_NEW',
        locality: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        lat: 12.9352,
        lon: 77.6245,
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
        ],
      },
    ];

    for (const item of listings) {
      const sellerId = userMap.get(item.sellerEmail);
      const categoryId = categoryMap.get(item.categorySlug);
      if (!sellerId || !categoryId) continue;

      const listingRes = await client.query(
        `INSERT INTO listings (seller_id, category_id, title, description, price, original_price, condition, status, locality, city, state, pincode, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [sellerId, categoryId, item.title, item.description, item.price, item.original_price, item.condition, item.locality, item.city, item.state, item.pincode, item.lat, item.lon]
      );

      const listingId = listingRes.rows[0].id;

      for (let i = 0; i < item.images.length; i++) {
        await client.query(
          `INSERT INTO listing_images (listing_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)`,
          [listingId, item.images[i], i === 0, i]
        );
      }
    }
    console.log(`[Seed] Seeded ${listings.length} active listings with images and coordinates.`);

    // Check if postgis extension is enabled, and populate coordinates geography
    const postgisActive = await checkPostGIS();
    if (postgisActive) {
      await client.query(`
        UPDATE listings 
        SET coordinates = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
        WHERE coordinates IS NULL;
        UPDATE addresses 
        SET coordinates = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
        WHERE coordinates IS NULL;
      `);
      console.log('[Seed] PostGIS coordinates geography columns synced.');
    }

    await client.query('COMMIT');
    console.log('[Seed] Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Error]', err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow direct execution
if (process.argv[1] && process.argv[1].includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

