import React, { useState } from 'react';
import { ShieldAlert, X, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'LISTING' | 'USER';
  targetId: string;
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState('Suspicious item / fake listing');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/reports', {
        targetType,
        targetId,
        reason,
        details,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert size={20} />
            <h3 className="font-bold text-slate-900 text-base">Report {targetType}</h3>
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
              <span>Report filed. Platform admins have been notified.</span>
            </div>
          )}

          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60 truncate">
            Reporting: <span className="font-semibold text-slate-900">{targetTitle}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="Suspicious item / fake listing">Suspicious item / fake listing</option>
              <option value="Fraudulent seller / scam">Fraudulent seller / scam</option>
              <option value="Inappropriate or offensive content">Inappropriate or offensive content</option>
              <option value="Incorrect location or misleading details">Incorrect location or misleading details</option>
              <option value="Item already sold elsewhere">Item already sold elsewhere</option>
              <option value="Other concern">Other concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide any context that will help our moderation team..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report for Moderation'}
          </button>
        </form>
      </div>
    </div>
  );
};

