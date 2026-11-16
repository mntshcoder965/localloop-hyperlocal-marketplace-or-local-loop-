import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

// Strictly enforce Admin role on all admin routes
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/suspend', adminController.toggleSuspension);
router.patch('/listings/:listingId/moderate', adminController.moderateListing);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id/resolve', adminController.resolveReport);

export const adminRoutes = router;

