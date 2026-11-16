import { Request, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service.js';

export const reviewsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, rating, comment } = req.body;
      const review = await reviewsService.addReview({
        orderId,
        reviewerId: req.user!.id,
        rating: parseInt(rating, 10),
        comment,
      });
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSellerReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewsService.getSellerReviews(req.params.sellerId);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  },
};

