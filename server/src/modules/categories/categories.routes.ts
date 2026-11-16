import { Router } from 'express';
import { categoriesController } from './categories.controller.js';

const router = Router();

router.get('/', categoriesController.getAll);

export const categoriesRoutes = router;

