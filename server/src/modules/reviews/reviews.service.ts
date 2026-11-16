import { reviewsRepository } from './reviews.repository.js';
import { ordersRepository } from '../orders/orders.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const reviewsService = {
  async addReview(data: {
    orderId: string;
    reviewerId: string;
    rating: number;
    comment?: string;
  }) {
    const order = await ordersRepository.getById(data.orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.buyer_id !== data.reviewerId) {
      throw new AppError('Only the buyer of the order can leave a review', 403);
    }

    if (order.status !== 'COMPLETED' && order.status !== 'PAYMENT_CONFIRMED') {
      throw new AppError('Can only review completed transactions', 400);
    }

    const alreadyReviewed = await reviewsRepository.hasReviewed(data.orderId, data.reviewerId);
    if (alreadyReviewed) {
      throw new AppError('You have already submitted a review for this order', 400);
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5 stars', 400);
    }

    return await reviewsRepository.createReview({
      orderId: data.orderId,
      reviewerId: data.reviewerId,
      revieweeId: order.seller_id,
      rating: data.rating,
      comment: data.comment,
    });
  },

  async getSellerReviews(sellerId: string) {
    return await reviewsRepository.getSellerReviews(sellerId);
  },
};

