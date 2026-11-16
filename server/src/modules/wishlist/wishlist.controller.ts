import { Request, Response, NextFunction } from 'express';
import { wishlistService } from './wishlist.service.js';

export const wishlistController = {
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;
      const result = await wishlistService.toggle(req.user!.id, listingId);
      res.json({
        success: true,
        message: result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await wishlistService.getMyWishlist(req.user!.id);
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  },

  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const isSaved = await wishlistService.isWishlisted(req.user!.id, req.params.listingId);
      res.json({
        success: true,
        data: { isWishlisted: isSaved },
      });
    } catch (err) {
      next(err);
    }
  },
};

