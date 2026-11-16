import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, reportsController.create);

export const reportsRoutes = router;

