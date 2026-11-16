import { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service.js';
import { processUploadedFile } from '../../middlewares/uploadMiddleware.js';

export const listingsController = {
  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No images provided' });
        return;
      }

      const uploaded = await Promise.all(
        files.map((file) => processUploadedFile(file))
      );

      res.json({
        success: true,
        data: uploaded,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.createListing(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: listing,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await listingsService.updateListing(req.params.id, req.user!.id, req.body);
      res.json({
        success: true,
        message: 'Listing updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await listingsService.deleteListing(req.params.id, req.user!.id);
      res.json({
        success: true,
        message: 'Listing removed successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const viewerId = req.user?.id;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

      const listing = await listingsService.getListingById(req.params.id, viewerId, lat, lon);
      res.json({
        success: true,
        data: listing,
      });
    } catch (err) {
      next(err);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const viewerId = req.user?.id;
      const filters = {
        q: req.query.q as string | undefined,
        category: req.query.category as string | undefined,
        condition: req.query.condition as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lon: req.query.lon ? parseFloat(req.query.lon as string) : undefined,
        radiusKm: req.query.radiusKm ? parseFloat(req.query.radiusKm as string) : undefined,
        pincode: req.query.pincode as string | undefined,
        sort: req.query.sort as any,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
      };

      const result = await listingsService.searchListings(filters, viewerId);
      res.json({
        success: true,
        data: result.listings,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyListings(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const listings = await listingsService.getMyListings(req.user!.id, status);
      res.json({
        success: true,
        data: listings,
      });
    } catch (err) {
      next(err);
    }
  },

  async markStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await listingsService.updateStatus(req.params.id, req.user!.id, status);
      res.json({
        success: true,
        message: `Listing status updated to ${status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};

