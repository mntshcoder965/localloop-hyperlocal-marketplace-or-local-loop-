import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

// Webhook endpoint (public with signature verification)
router.post('/webhook', ordersController.webhook);

// Protected endpoints
router.use(authenticate);

router.get('/', ordersController.getMyOrders);
router.post('/', ordersController.create);
router.get('/:id', ordersController.getById);
router.post('/:id/verify-payment', ordersController.verifyPayment);
router.post('/:id/confirm-meetup', ordersController.confirmMeetup);
router.post('/:id/cancel', ordersController.cancel);

export const ordersRoutes = router;

