import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('LocalLoop Backend API Integration Tests', () => {
  let authToken: string;
  let sellerToken: string;
  let createdListingId: string;
  let offerId: string;
  let orderId: string;

  describe('Health & Metadata APIs', () => {
    it('GET /health should return 200 and UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });

    it('GET /api/v1/categories should return seeded categories', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/locations/pincode/560038 should resolve Indiranagar, Bengaluru', async () => {
      const res = await request(app).get('/api/v1/locations/pincode/560038');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.locality).toContain('Indiranagar');
      expect(res.body.data.city).toBe('Bengaluru');
    });
  });

  describe('Authentication APIs', () => {
    const testEmail = `testuser_${Date.now()}@example.com`;

    it('POST /api/v1/auth/register should create a new user and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Buyer',
          email: testEmail,
          password: 'Password123!',
          phone: '+919876543210',
          role: 'BUYER',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      authToken = res.body.data.accessToken;
    });

    it('POST /api/v1/auth/login should authenticate seeded seller', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'rahul.seller@gmail.com',
          password: 'MarketPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Rahul Sharma');
      sellerToken = res.body.data.accessToken;
    });

    it('GET /api/v1/auth/me should return current authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail.toLowerCase());
    });
  });

  describe('Listings & Spatial Hyperlocal Search APIs', () => {
    it('GET /api/v1/listings should search active listings with pagination', async () => {
      const res = await request(app).get('/api/v1/listings?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('GET /api/v1/listings with lat & lon should calculate distance and filter radius', async () => {
      // Indiranagar coords: 12.9719, 77.6412
      const res = await request(app).get(
        '/api/v1/listings?lat=12.9719&lon=77.6412&radiusKm=10&sort=nearest'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      // Items in Indiranagar/Koramangala should have a distance_km property
      expect(res.body.data[0].distance_km).toBeDefined();
      expect(res.body.data[0].distance_km).toBeLessThanOrEqual(10);
    });

    it('POST /api/v1/listings should allow authenticated seller to create listing', async () => {
      const catRes = await request(app).get('/api/v1/categories');
      const categoryId = catRes.body.data[0].id;

      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Brand New Mechanical Keyboard RGB',
          description: 'Hot swappable brown switches, wireless Bluetooth and 2.4GHz with PBT keycaps.',
          category_id: categoryId,
          price: 3500,
          original_price: 5999,
          condition: 'LIKE_NEW',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          latitude: 12.9719,
          longitude: 77.6412,
          images: [
            { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', is_primary: true }
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Mechanical Keyboard');
      createdListingId = res.body.data.id;
    });
  });

  describe('Wishlist APIs', () => {
    it('POST /api/v1/wishlist/:id/toggle should toggle wishlist state', async () => {
      const res = await request(app)
        .post(`/api/v1/wishlist/${createdListingId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.wishlisted).toBe(true);
    });

    it('GET /api/v1/wishlist should return saved listings', async () => {
      const res = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(createdListingId);
    });
  });

  describe('Offers & Negotiation APIs', () => {
    it('POST /api/v1/offers should allow buyer to submit a price offer', async () => {
      const res = await request(app)
        .post('/api/v1/offers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          listingId: createdListingId,
          amount: 3000,
          message: 'Can you do 3000? I can pick up today in Indiranagar.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      expect(Number(res.body.data.amount)).toBe(3000);
      offerId = res.body.data.id;
    });

    it('PATCH /api/v1/offers/:id/accept should allow seller to accept the offer', async () => {
      const res = await request(app)
        .patch(`/api/v1/offers/${offerId}/accept`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
    });
  });

  describe('Order Fulfillment & Meetup Confirmation Handshake', () => {
    it('POST /api/v1/orders should create an offline meetup order', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          listingId: createdListingId,
          offerId: offerId,
          transactionType: 'OFFLINE',
          meetupLocation: 'Starbucks, 100 Feet Road, Indiranagar',
          meetupTime: new Date(Date.now() + 86400000).toISOString(),
          meetupNotes: 'Meeting at 5 PM near outside seating.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('MEETUP_SCHEDULED');
      expect(Number(res.body.data.order.amount)).toBe(3000); // Negotiated price from offer
      orderId = res.body.data.order.id;
    });

    it('Buyer confirms meetup exchange', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${orderId}/confirm-meetup`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('MEETUP_CONFIRMED_BUYER');
      expect(res.body.data.buyer_confirmed).toBe(true);
    });

    it('Seller confirms meetup exchange -> completes transaction', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${orderId}/confirm-meetup`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.seller_confirmed).toBe(true);
    });
  });

  describe('Reviews & Ratings', () => {
    it('POST /api/v1/reviews should allow buyer of completed order to review seller', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: orderId,
          rating: 5,
          comment: 'Great seller! Item was in perfect condition as described.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });
  });
});

