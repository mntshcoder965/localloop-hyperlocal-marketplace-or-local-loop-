import { offersRepository } from './offers.repository.js';
import { listingsRepository } from '../listings/listings.repository.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const offersService = {
  async makeOffer(data: {
    listingId: string;
    buyerId: string;
    amount: number;
    message?: string;
    conversationId?: string;
  }) {
    const listing = await listingsRepository.getById(data.listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.status !== 'ACTIVE') {
      throw new AppError('This listing is no longer accepting offers', 400);
    }

    if (listing.seller_id === data.buyerId) {
      throw new AppError('You cannot make an offer on your own listing', 400);
    }

    if (data.amount <= 0) {
      throw new AppError('Offer amount must be greater than zero', 400);
    }

    return await offersRepository.create({
      listingId: data.listingId,
      buyerId: data.buyerId,
      sellerId: listing.seller_id,
      amount: data.amount,
      message: data.message,
      conversationId: data.conversationId,
    });
  },

  async acceptOffer(offerId: string, sellerId: string) {
    const offer = await offersRepository.getById(offerId);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    if (offer.seller_id !== sellerId) {
      throw new AppError('Only the seller can accept this offer', 403);
    }

    if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
      throw new AppError(`Cannot accept an offer in ${offer.status} status`, 400);
    }

    return await offersRepository.updateStatus(offerId, 'ACCEPTED');
  },

  async rejectOffer(offerId: string, sellerId: string) {
    const offer = await offersRepository.getById(offerId);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    if (offer.seller_id !== sellerId) {
      throw new AppError('Only the seller can reject this offer', 403);
    }

    return await offersRepository.updateStatus(offerId, 'REJECTED');
  },

  async counterOffer(offerId: string, userId: string, counterAmount: number) {
    const offer = await offersRepository.getById(offerId);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    if (offer.seller_id !== userId && offer.buyer_id !== userId) {
      throw new AppError('Forbidden: Not a party to this offer', 403);
    }

    if (counterAmount <= 0) {
      throw new AppError('Counteroffer amount must be positive', 400);
    }

    return await offersRepository.updateStatus(offerId, 'COUNTERED', counterAmount);
  },

  async withdrawOffer(offerId: string, buyerId: string) {
    const offer = await offersRepository.getById(offerId);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    if (offer.buyer_id !== buyerId) {
      throw new AppError('Only the buyer can withdraw this offer', 403);
    }

    if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
      throw new AppError(`Cannot withdraw an offer that is already ${offer.status}`, 400);
    }

    return await offersRepository.updateStatus(offerId, 'WITHDRAWN');
  },

  async getMyOffers(userId: string, role: 'BUYER' | 'SELLER') {
    return await offersRepository.getByUser(userId, role);
  },

  async getListingOffers(listingId: string, sellerId: string) {
    const listing = await listingsRepository.getById(listingId);
    if (!listing || listing.seller_id !== sellerId) {
      throw new AppError('Listing not found or unauthorized', 403);
    }
    return await offersRepository.getByListing(listingId);
  },
};

