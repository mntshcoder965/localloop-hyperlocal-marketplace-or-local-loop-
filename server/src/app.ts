import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

// Modular Route Imports
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { locationsRoutes } from './modules/locations/locations.routes.js';
import { listingsRoutes } from './modules/listings/listings.routes.js';
import { wishlistRoutes } from './modules/wishlist/wishlist.routes.js';
import { conversationsRoutes } from './modules/conversations/conversations.routes.js';
import { offersRoutes } from './modules/offers/offers.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { reviewsRoutes } from './modules/reviews/reviews.routes.js';
import { reportsRoutes } from './modules/reports/reports.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';

export function createApp() {
  const app = express();

  // Security headers with Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Vite dev & Leaflet tile compatibility
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads serving
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Rate Limiting
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'LocalLoop API',
      environment: config.env,
    });
  });

  // REST API v1 Routing
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/users', usersRoutes);
  apiRouter.use('/categories', categoriesRoutes);
  apiRouter.use('/locations', locationsRoutes);
  apiRouter.use('/listings', listingsRoutes);
  apiRouter.use('/wishlist', wishlistRoutes);
  apiRouter.use('/conversations', conversationsRoutes);
  apiRouter.use('/offers', offersRoutes);
  apiRouter.use('/orders', ordersRoutes);
  apiRouter.use('/reviews', reviewsRoutes);
  apiRouter.use('/reports', reportsRoutes);
  apiRouter.use('/admin', adminRoutes);
  apiRouter.use('/notifications', notificationsRoutes);

  app.use('/api/v1', apiRouter);

  // 404 handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
  });

  // Centralized Error Middleware
  app.use(errorMiddleware);

  return app;
}

