'use client';

import { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Review } from '@/types';

interface ReportReviewModalProps {
  review: Review;
  onClose: () => void;
  onReportSuccess: () => void;
}

export function ReportReviewModal({
  review,
  onClose,
  onReportSuccess,
}: ReportReviewModalProps) {
  const [reason, setReason] = useState<'spam' | 'offensive' | 'fake' | 'irrelevant' | 'other'>('fake');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: review.id,
          reason,
          details: details.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      onReportSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[var(--rg-surface)] border-2 border-[var(--rg-rust-dim)] rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--rg-ink-faint)] hover:text-[var(--rg-ink)] p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] rg-mono font-bold tracking-widest text-[var(--rg-rust)] uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            TRUST &amp; SAFETY MODERATION
          </span>
          <h3 className="text-xl font-bold text-[var(--rg-ink)] rg-display">
            Report This Review
          </h3>
          <p className="text-xs text-[var(--rg-ink-dim)]">
            Flagging review by <strong className="text-[var(--rg-ink)]">{review.reviewerName}</strong> on {review.propertyName}.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[rgba(193,85,61,0.12)] border border-[var(--rg-rust-dim)] text-[var(--rg-rust)] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium block">
              Why are you reporting this review?
            </label>
            <div className="space-y-2 text-xs rg-mono">
              {[
                { id: 'fake', label: 'Fake review / Not an actual guest or tenant' },
                { id: 'spam', label: 'Spam, advertising, or promotional content' },
                { id: 'offensive', label: 'Offensive, abusive, or discriminatory language' },
                { id: 'irrelevant', label: 'Irrelevant to the property condition or stay' },
                { id: 'other', label: 'Other violation of community guidelines' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--rg-line)] hover:border-[var(--rg-rust-dim)] bg-[var(--rg-surface-raised)] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.id}
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id as any)}
                    className="accent-[var(--rg-rust)]"
                  />
                  <span className="text-[var(--rg-ink)]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs rg-mono text-[var(--rg-ink-dim)]">Additional Details (Optional):</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any context that will assist moderation review..."
              rows={2}
              className="w-full bg-[var(--rg-bg)] border border-[var(--rg-line-strong)] p-2.5 text-xs text-[var(--rg-ink)] rounded-xl outline-none focus:border-[var(--rg-rust)] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--rg-surface-raised)] text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] border border-[var(--rg-line-strong)] rounded-lg text-xs font-bold rg-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[var(--rg-rust)] hover:bg-[#d66248] text-white font-bold text-xs rg-mono rounded-lg shadow-[0_0_15px_rgba(193,85,61,0.3)] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Reporting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportReviewModal;
