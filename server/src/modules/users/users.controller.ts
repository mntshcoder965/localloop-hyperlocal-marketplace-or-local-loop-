import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';

export const usersController = {
  async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const addresses = await usersService.getAddresses(req.user!.id);
      res.json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  },

  async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await usersService.addAddress(req.user!.id, req.body);
      res.status(201).json({ success: true, message: 'Address added', data: address });
    } catch (err) {
      next(err);
    }
  },

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.deleteAddress(req.user!.id, req.params.id);
      res.json({ success: true, message: 'Address removed' });
    } catch (err) {
      next(err);
    }
  },

  async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.setDefaultAddress(req.user!.id, req.params.id);
      res.json({ success: true, message: 'Default address updated' });
    } catch (err) {
      next(err);
    }
  },

  async getSellerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getSellerProfile(req.params.id);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },
};

