import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.getMyNotifications);
router.patch('/:id/read', notificationsController.markRead);
router.patch('/read-all', notificationsController.markAllRead);

export const notificationsRoutes = router;

