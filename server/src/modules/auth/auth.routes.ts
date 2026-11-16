import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validateMiddleware.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export const authRoutes = router;

