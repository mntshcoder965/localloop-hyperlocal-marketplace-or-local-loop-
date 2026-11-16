import { Router } from 'express';
import { offersController } from './offers.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', offersController.getMyOffers);
router.get('/listing/:listingId', offersController.getListingOffers);
router.post('/', offersController.makeOffer);
router.patch('/:id/accept', offersController.accept);
router.patch('/:id/reject', offersController.reject);
router.patch('/:id/counter', offersController.counter);
router.patch('/:id/withdraw', offersController.withdraw);

export const offersRoutes = router;

