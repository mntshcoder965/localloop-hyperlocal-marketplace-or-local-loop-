import { listingsRepository } from './listings.repository.js';
import { CreateListingDTO, ListingFilterQuery, UpdateListingDTO } from './listings.types.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

export const listingsService = {
  async createListing(sellerId: string, data: CreateListingDTO) {
    return await listingsRepository.create(sellerId, data);
  },

  async updateListing(listingId: string, sellerId: string, data: UpdateListingDTO) {
    const updated = await listingsRepository.update(listingId, sellerId, data);
    if (!updated) {
      throw new AppError('Listing not found or you are not authorized to edit this listing', 404);
    }
    return updated;
  },

  async deleteListing(listingId: string, sellerId: string) {
    const success = await listingsRepository.delete(listingId, sellerId);
    if (!success) {
      throw new AppError('Listing not found or you are not authorized to delete this listing', 404);
    }
  },

  async getListingById(listingId: string, viewerId?: string, viewerLat?: number, viewerLon?: number) {
    const listing = await listingsRepository.getById(listingId, viewerId, viewerLat, viewerLon);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }
    return listing;
  },

  async searchListings(filters: ListingFilterQuery, viewerId?: string) {
    return await listingsRepository.search(filters, viewerId);
  },

  async getMyListings(sellerId: string, status?: string) {
    return await listingsRepository.getMyListings(sellerId, status);
  },

  async updateStatus(listingId: string, sellerId: string, status: 'ACTIVE' | 'RESERVED' | 'SOLD') {
    return await listingsRepository.update(listingId, sellerId, { status });
  },
};

