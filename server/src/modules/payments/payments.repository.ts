import { query } from '../../config/db.js';

export interface PaymentEntity {
  id: string;
  order_id: string;
  user_id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  payment_method?: string;
  payload?: any;
  created_at: Date;
  updated_at: Date;
}

export const paymentsRepository = {
  async create(data: {
    orderId: string;
    userId: string;
    razorpayOrderId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentEntity> {
    const res = await query<PaymentEntity>(
      `INSERT INTO payments (order_id, user_id, razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [data.orderId, data.userId, data.razorpayOrderId, data.amount, data.currency || 'INR']
    );
    return res.rows[0];
  },

  async markSuccess(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    payload?: any;
  }): Promise<PaymentEntity | null> {
    const res = await query<PaymentEntity>(
      `UPDATE payments 
       SET status = 'SUCCESS',
           razorpay_payment_id = $1,
           razorpay_signature = $2,
           payload = $3,
           updated_at = NOW()
       WHERE razorpay_order_id = $4
       RETURNING *`,
      [data.razorpayPaymentId, data.razorpaySignature, data.payload ? JSON.stringify(data.payload) : null, data.razorpayOrderId]
    );
    return res.rows[0] || null;
  },

  async markFailed(razorpayOrderId: string, reason?: string): Promise<PaymentEntity | null> {
    const res = await query<PaymentEntity>(
      `UPDATE payments 
       SET status = 'FAILED',
           payload = jsonb_build_object('failure_reason', $1::text),
           updated_at = NOW()
       WHERE razorpay_order_id = $2
       RETURNING *`,
      [reason || 'Payment failed', razorpayOrderId]
    );
    return res.rows[0] || null;
  },

  async getByOrderId(orderId: string): Promise<PaymentEntity | null> {
    const res = await query<PaymentEntity>('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return res.rows[0] || null;
  },

  async getByRazorpayOrderId(razorpayOrderId: string): Promise<PaymentEntity | null> {
    const res = await query<PaymentEntity>('SELECT * FROM payments WHERE razorpay_order_id = $1', [razorpayOrderId]);
    return res.rows[0] || null;
  },
};

