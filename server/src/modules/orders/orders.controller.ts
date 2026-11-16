import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service.js';

export const ordersController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId, offerId, transactionType, meetupLocation, meetupTime, meetupNotes } = req.body;
      const result = await ordersService.createOrder({
        listingId,
        buyerId: req.user!.id,
        offerId,
        transactionType,
        meetupLocation,
        meetupTime: meetupTime ? new Date(meetupTime) : undefined,
        meetupNotes,
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const updatedOrder = await ordersService.verifyPayment({
        orderId: req.params.id,
        userId: req.user!.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      res.json({
        success: true,
        message: 'Payment verified successfully and transaction completed',
        data: updatedOrder,
      });
    } catch (err) {
      next(err);
    }
  },

  async confirmMeetup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.confirmMeetupExchange(req.params.id, req.user!.id);
      res.json({
        success: true,
        message: result.isCompleted
          ? 'Both parties confirmed! Transaction marked COMPLETED.'
          : 'Meetup exchange confirmed on your end. Awaiting confirmation from other party.',
        data: result.order,
      });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const cancelled = await ordersService.cancelOrder(req.params.id, req.user!.id);
      res.json({
        success: true,
        message: 'Order cancelled and listing released',
        data: cancelled,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.query.role as 'BUYER' | 'SELLER') || 'BUYER';
      const orders = await ordersService.getMyOrders(req.user!.id, role);
      res.json({
        success: true,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.getOrderById(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      await ordersService.handleWebhook(JSON.stringify(req.body), signature, req.body);
      res.json({ status: 'ok' });
    } catch (err) {
      next(err);
    }
  },
};

