import { Router } from 'express';
import { locationsController } from './locations.controller.js';

const router = Router();

router.get('/pincode/:pincode', locationsController.getByPincode);
router.get('/reverse', locationsController.reverse);
router.get('/hubs', locationsController.getPopularHubs);

export const locationsRoutes = router;

