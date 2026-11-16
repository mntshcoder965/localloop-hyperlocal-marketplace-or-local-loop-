import { Router } from 'express';
import { conversationsController } from './conversations.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', conversationsController.getMyConversations);
router.post('/', conversationsController.getOrCreate);
router.get('/:id/messages', conversationsController.getMessages);
router.post('/:id/messages', conversationsController.sendMessage);
router.patch('/:id/read', conversationsController.markRead);

export const conversationsRoutes = router;

