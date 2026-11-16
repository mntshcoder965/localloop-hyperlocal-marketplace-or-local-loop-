import { wishlistRepository } from './wishlist.repository.js';

export const wishlistService = {
  async toggle(userId: string, listingId: string): Promise<{ wishlisted: boolean }> {
    const isSaved = await wishlistRepository.isWishlisted(userId, listingId);
    if (isSaved) {
      await wishlistRepository.remove(userId, listingId);
      return { wishlisted: false };
    } else {
      await wishlistRepository.add(userId, listingId);
      return { wishlisted: true };
    }
  },

  async getMyWishlist(userId: string) {
    return await wishlistRepository.getByUser(userId);
  },

  async isWishlisted(userId: string, listingId: string) {
    return await wishlistRepository.isWishlisted(userId, listingId);
  },
};

