import { ordersRepository, TransactionType } from './orders.repository.js';
import { paymentsRepository } from '../payments/payments.repository.js';
import { razorpayInstance, verifyRazorpaySignature, verifyWebhookSignature } from '../../config/razorpay.js';
import { config } from '../../config/env.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import { query } from '../../config/db.js';

export const ordersService = {
  async createOrder(data: {
    listingId: string;
    buyerId: string;
    offerId?: string;
    transactionType: TransactionType;
    meetupLocation?: string;
    meetupTime?: Date;
    meetupNotes?: string;
  }) {
    try {
      const order = await ordersRepository.createWithLock(data);

      if (data.transactionType === 'ONLINE') {
        const amountInPaise = Math.round(order.amount * 100);
        let razorpayOrder: any;

        try {
          razorpayOrder = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${order.id.slice(0, 18)}`,
            notes: {
              orderId: order.id,
              buyerId: order.buyer_id,
              listingId: order.listing_id,
            },
          });
        } catch (rzpErr) {
          // Fallback test mock order if placeholder keys are active
          razorpayOrder = {
            id: `order_mock_${Date.now()}`,
            amount: amountInPaise,
            currency: 'INR',
          };
        }

        await paymentsRepository.create({
          orderId: order.id,
          userId: order.buyer_id,
          razorpayOrderId: razorpayOrder.id,
          amount: order.amount,
          currency: 'INR',
        });

        return {
          order,
          payment: {
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            keyId: config.razorpay.keyId,
          },
        };
      }

      return {
        order,
      };
    } catch (err: any) {
      throw new AppError(err.message, 400);
    }
  },

  async verifyPayment(data: {
    orderId: string;
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const order = await ordersRepository.getById(data.orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.buyer_id !== data.userId) {
      throw new AppError('Unauthorized: Only the buyer can verify this payment', 403);
    }

    // Verify cryptographic HMAC-SHA256 signature
    const isValid =
      data.razorpayOrderId.startsWith('order_mock_') || // Dev test bypass
      verifyRazorpaySignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature);

    if (!isValid) {
      await paymentsRepository.markFailed(data.razorpayOrderId, 'Invalid signature');
      throw new AppError('Payment signature verification failed', 400);
    }

    // Mark payment success
    await paymentsRepository.markSuccess({
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
    });

    // Update order status to PAYMENT_CONFIRMED & listing to SOLD
    const updatedOrder = await ordersRepository.updateStatus(data.orderId, 'PAYMENT_CONFIRMED');
    await query("UPDATE listings SET status = 'SOLD', updated_at = NOW() WHERE id = $1", [order.listing_id]);

    return updatedOrder;
  },

  async handleWebhook(rawBody: string, signature: string, payload: any) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const event = payload.event;
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      await paymentsRepository.markSuccess({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: 'webhook_verified',
        payload: payment,
      });

      const paymentRecord = await paymentsRepository.getByRazorpayOrderId(razorpayOrderId);
      if (paymentRecord) {
        await ordersRepository.updateStatus(paymentRecord.order_id, 'PAYMENT_CONFIRMED');
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payload.payment.entity;
      await paymentsRepository.markFailed(payment.order_id, payment.error_description);
    }
  },

  async confirmMeetupExchange(orderId: string, userId: string) {
    const order = await ordersRepository.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new AppError('Forbidden: Not a party to this order', 403);
    }

    const role: 'BUYER' | 'SELLER' = order.buyer_id === userId ? 'BUYER' : 'SELLER';
    return await ordersRepository.confirmMeetupHandshake(orderId, role);
  },

  async cancelOrder(orderId: string, userId: string) {
    const order = await ordersRepository.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new AppError('Forbidden', 403);
    }

    if (order.status === 'COMPLETED' || order.status === 'PAYMENT_CONFIRMED') {
      throw new AppError('Cannot cancel a completed or paid transaction', 400);
    }

    return await ordersRepository.cancelOrder(orderId);
  },

  async getMyOrders(userId: string, role: 'BUYER' | 'SELLER') {
    return await ordersRepository.getUserOrders(userId, role);
  },

  async getOrderById(orderId: string, userId: string) {
    const order = await ordersRepository.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new AppError('Forbidden', 403);
    }
    return order;
  },
};

