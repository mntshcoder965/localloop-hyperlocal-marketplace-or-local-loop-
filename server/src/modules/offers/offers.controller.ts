import { Request, Response, NextFunction } from 'express';
import { offersService } from './offers.service.js';

export const offersController = {
  async makeOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId, amount, message, conversationId } = req.body;
      const offer = await offersService.makeOffer({
        listingId,
        buyerId: req.user!.id,
        amount: parseFloat(amount),
        message,
        conversationId,
      });
      res.status(201).json({
        success: true,
        message: 'Offer submitted successfully',
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await offersService.acceptOffer(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Offer accepted', data: updated });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await offersService.rejectOffer(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Offer rejected', data: updated });
    } catch (err) {
      next(err);
    }
  },

  async counter(req: Request, res: Response, next: NextFunction) {
    try {
      const { counterAmount } = req.body;
      const updated = await offersService.counterOffer(req.params.id, req.user!.id, parseFloat(counterAmount));
      res.json({ success: true, message: 'Counteroffer sent', data: updated });
    } catch (err) {
      next(err);
    }
  },

  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await offersService.withdrawOffer(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Offer withdrawn', data: updated });
    } catch (err) {
      next(err);
    }
  },

  async getMyOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.query.role as 'BUYER' | 'SELLER') || 'BUYER';
      const offers = await offersService.getMyOffers(req.user!.id, role);
      res.json({ success: true, data: offers });
    } catch (err) {
      next(err);
    }
  },

  async getListingOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await offersService.getListingOffers(req.params.listingId, req.user!.id);
      res.json({ success: true, data: offers });
    } catch (err) {
      next(err);
    }
  },
};

