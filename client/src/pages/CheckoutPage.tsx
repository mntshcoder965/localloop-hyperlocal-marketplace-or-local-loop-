import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  MapPin,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { Listing, TransactionType } from '../types';
import { useAuthStore } from '../stores/authStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get('offerId') || undefined;

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [listing, setListing] = useState<Listing | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>('ONLINE');

  // Meetup fields
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupDate, setMeetupDate] = useState('');
  const [meetupNotes, setMeetupNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/listings/${listingId}`);
        setListing(res.data.data);
        setMeetupLocation(`${res.data.data.locality}, ${res.data.data.city}`);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load listing for checkout');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) fetchListing();
  }, [listingId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      const orderPayload = {
        listingId,
        offerId,
        transactionType,
        meetupLocation: transactionType === 'OFFLINE' ? meetupLocation : undefined,
        meetupTime: transactionType === 'OFFLINE' && meetupDate ? new Date(meetupDate).toISOString() : undefined,
        meetupNotes: transactionType === 'OFFLINE' ? meetupNotes : undefined,
      };

      const res = await api.post('/orders', orderPayload);
      const { order, payment } = res.data.data;

      if (transactionType === 'ONLINE' && payment) {
        // Open Razorpay Checkout Modal
        if (typeof window.Razorpay === 'undefined') {
          // Fallback direct mock verification if script blocked
          await api.post(`/orders/${order.id}/verify-payment`, {
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_signature',
          });
          setSuccessOrder(order);
          setIsProcessing(false);
          return;
        }

        const options = {
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          name: 'LocalLoop Marketplace',
          description: listing?.title,
          order_id: payment.razorpayOrderId,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || '',
          },
          theme: {
            color: '#0f2744',
          },
          handler: async (response: any) => {
            try {
              await api.post(`/orders/${order.id}/verify-payment`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setSuccessOrder(order);
            } catch (vErr: any) {
              setError(vErr.response?.data?.message || 'Payment signature verification failed');
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Offline Meetup Scheduled
        setSuccessOrder(order);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transaction could not be initialized');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {transactionType === 'ONLINE' ? 'Payment Verified & Confirmed!' : 'Meetup Exchange Scheduled!'}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {transactionType === 'ONLINE'
            ? 'Your payment has been securely held and the listing is marked SOLD. You can now coordinate handover with the seller.'
            : 'Your meetup order has been generated. Both you and the seller must confirm the physical exchange in your Dashboard to mark it completed.'}
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Order ID:</span>
            <span className="font-mono text-slate-700">{successOrder.id.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Amount:</span>
            <span className="font-bold text-slate-900">₹{listing?.price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Link
          to="/dashboard?tab=orders"
          className="w-full py-3 bg-brand-900 text-white rounded-xl text-xs font-bold block"
        >
          View in My Orders Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout & Order Placement</h1>
        <p className="text-xs text-slate-500">Choose between secure online checkout or physical meetup exchange</p>
      </div>

      <form onSubmit={handleCheckout} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Product Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <img
            src={listing?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80'}
            alt=""
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">{listing?.title}</h3>
            <p className="text-xs text-slate-500">Seller: {listing?.seller_name} • {listing?.locality}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-slate-900">
              ₹{listing?.price.toLocaleString('en-IN')}
            </span>
            {offerId && (
              <span className="block text-[10px] font-bold text-teal-600">Accepted Offer Rate</span>
            )}
          </div>
        </div>

        {/* Fulfillment Method Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 block">Choose Fulfillment Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTransactionType('ONLINE')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                transactionType === 'ONLINE'
                  ? 'border-brand-900 bg-brand-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-brand-900 text-white rounded-lg">
                  <CreditCard size={18} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Online Razorpay</h4>
              </div>
              <p className="text-xs text-slate-500">
                Pay instantly via UPI, Cards, or NetBanking in test sandbox mode.
              </p>
            </div>

            <div
              onClick={() => setTransactionType('OFFLINE')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                transactionType === 'OFFLINE'
                  ? 'border-brand-900 bg-brand-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-teal-600 text-white rounded-lg">
                  <MapPin size={18} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Offline Meetup Handshake</h4>
              </div>
              <p className="text-xs text-slate-500">
                Meet in person locally. Both parties verify item and confirm exchange.
              </p>
            </div>
          </div>
        </div>

        {/* Offline Specific Inputs */}
        {transactionType === 'OFFLINE' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Meetup Arrangement</h4>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Suggested Public Location (Coffee shop, Mall, Metro)
              </label>
              <input
                type="text"
                value={meetupLocation}
                onChange={(e) => setMeetupLocation(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  value={meetupDate}
                  onChange={(e) => setMeetupDate(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes for Seller</label>
                <input
                  type="text"
                  placeholder="e.g. Will carry exact cash"
                  value={meetupNotes}
                  onChange={(e) => setMeetupNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 bg-brand-900 hover:bg-brand-800 text-white rounded-2xl text-sm font-extrabold shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Lock size={16} />
          <span>
            {isProcessing
              ? 'Processing Transaction...'
              : transactionType === 'ONLINE'
              ? `Proceed to Razorpay Checkout (₹${listing?.price.toLocaleString('en-IN')})`
              : 'Confirm & Schedule Meetup'}
          </span>
        </button>
      </form>
    </div>
  );
};

