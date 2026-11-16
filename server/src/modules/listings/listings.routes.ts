import { Router } from 'express';
import { listingsController } from './listings.controller.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/authMiddleware.js';
import { validate } from '../../middlewares/validateMiddleware.js';
import { upload } from '../../middlewares/uploadMiddleware.js';
import { createListingSchema, updateListingSchema } from './listings.validation.js';

const router = Router();

// Public / Search endpoints
router.get('/', optionalAuthenticate, listingsController.search);
router.get('/my', authenticate, listingsController.getMyListings);
router.get('/:id', optionalAuthenticate, listingsController.getById);

// Seller action endpoints
router.post('/upload', authenticate, upload.array('images', 6), listingsController.uploadImages);
router.post('/', authenticate, validate(createListingSchema), listingsController.create);
router.patch('/:id', authenticate, validate(updateListingSchema), listingsController.update);
router.patch('/:id/status', authenticate, listingsController.markStatus);
router.delete('/:id', authenticate, listingsController.delete);

export const listingsRoutes = router;

