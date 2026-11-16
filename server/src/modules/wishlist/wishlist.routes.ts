import { Router } from 'express';
import { wishlistController } from './wishlist.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getMyWishlist);
router.post('/:listingId/toggle', wishlistController.toggle);
router.get('/check/:listingId', wishlistController.check);

export const wishlistRoutes = router;

