import React, { useState } from 'react';
import { Tag, X, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  onOfferSuccess: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingPrice,
  onOfferSuccess,
}) => {
  const [offerAmount, setOfferAmount] = useState<string>(Math.round(listingPrice * 0.9).toString());
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/offers', {
        listingId,
        amount,
        message,
      });

      setSuccess(true);
      setTimeout(() => {
        onOfferSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountNum = parseFloat(offerAmount) || 0;
  const difference = listingPrice - amountNum;
  const percentBelow = listingPrice > 0 ? Math.round((difference / listingPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-900 rounded-xl">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Make a Price Offer</h3>
              <p className="text-xs text-slate-500">Negotiate a fair price with the seller</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <Check size={16} className="shrink-0" />
              <span>Offer sent successfully to the seller!</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="text-xs text-slate-500 line-clamp-1">{listingTitle}</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Original Listed Price: ₹{listingPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Offer Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-500">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            {percentBelow > 0 && (
              <p className="text-xs text-teal-600 font-semibold mt-1">
                {percentBelow}% below the listed price (save ₹{difference.toLocaleString('en-IN')})
              </p>
            )}
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2">
            {[0.95, 0.9, 0.85].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setOfferAmount(Math.round(listingPrice * pct).toString())}
                className="flex-1 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                ₹{Math.round(listingPrice * pct).toLocaleString('en-IN')} (-{Math.round((1 - pct) * 100)}%)
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message to Seller (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Can meet you today in Indiranagar at 5 PM for instant pickup."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-3 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending Offer...' : 'Send Offer to Seller'}
          </button>
        </form>
      </div>
    </div>
  );
};

