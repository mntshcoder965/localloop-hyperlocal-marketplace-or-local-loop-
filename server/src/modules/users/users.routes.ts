import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

// Addresses
router.get('/addresses', authenticate, usersController.getAddresses);
router.post('/addresses', authenticate, usersController.addAddress);
router.delete('/addresses/:id', authenticate, usersController.deleteAddress);
router.patch('/addresses/:id/default', authenticate, usersController.setDefaultAddress);

// Public seller profile
router.get('/sellers/:id', usersController.getSellerProfile);

export const usersRoutes = router;

