import { Router } from 'express';
import { reviewsController } from './reviews.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/seller/:sellerId', reviewsController.getSellerReviews);
router.post('/', authenticate, reviewsController.create);

export const reviewsRoutes = router;

