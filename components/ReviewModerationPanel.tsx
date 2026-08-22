'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  EyeOff,
  Trash2,
  AlertTriangle,
  Star,
  Building,
  RefreshCw,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Review } from '@/types';

interface ReviewModerationPanelProps {
  reviews: Review[];
  onRefresh: () => void;
}

export function ReviewModerationPanel({ reviews, onRefresh }: ReviewModerationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'hidden' | 'approved'>('flagged');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter only RentGuard first-party reviews for moderation (Google reviews are read-only)
  const rentGuardReviews = reviews.filter((r) => r.source === 'RENTGUARD');

  const filtered = rentGuardReviews.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleModerate = async (reviewId: string, action: 'approve' | 'hide' | 'delete' | 'unflag') => {
    setProcessingId(reviewId);
    try {
      const res = await fetch('/api/reviews/moderate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Moderation error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Moderation Banner */}
      <div className="p-4 rounded-xl border border-[var(--rg-brass-dim)] bg-[rgba(201,154,75,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(201,154,75,0.15)] text-[var(--rg-brass)] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase rg-mono text-[var(--rg-ink)]">
              RentGuard First-Party Review Moderation Queue
            </h4>
            <p className="text-[11px] text-[var(--rg-ink-dim)]">
              Review and moderate reported or pending community reviews. <strong>Google reviews are external and read-only</strong> and are not displayed in this queue.
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 p-1 bg-[var(--rg-surface)] border border-[var(--rg-line-strong)] rounded-lg text-xs rg-mono">
          {(['flagged', 'hidden', 'approved', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                'px-2.5 py-1 rounded transition-all capitalize font-semibold cursor-pointer',
                filter === st
                  ? 'bg-[var(--rg-brass)] text-black font-bold'
                  : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
              )}
            >
              {st} ({rentGuardReviews.filter((r) => (st === 'all' ? true : r.status === st)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Review Queue List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs rg-mono text-[var(--rg-ink-faint)] border border-dashed border-[var(--rg-line-strong)] rounded-2xl">
            No reviews matching status "{filter}". Queue is clear.
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className={cn(
                'p-4 rounded-xl border bg-[var(--rg-surface)] space-y-3 transition-all',
                review.status === 'flagged'
                  ? 'border-[var(--rg-rust-dim)] bg-[rgba(193,85,61,0.03)]'
                  : 'border-[var(--rg-line-strong)]'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--rg-ink)]">{review.reviewerName}</span>
                  {review.verifiedStay && (
                    <span className="text-[10px] rg-mono px-2 py-0.2 rounded bg-[rgba(75,156,147,0.12)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Stay
                    </span>
                  )}
                  <span className="text-xs text-[var(--rg-ink-dim)]">on {review.propertyName}</span>
                </div>

                <div className="flex items-center gap-2 text-xs rg-mono">
                  <span className="flex items-center gap-1 text-[var(--rg-brass)] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[var(--rg-brass)]" /> {review.rating}.0
                  </span>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded font-bold uppercase',
                      review.status === 'flagged'
                        ? 'bg-[rgba(193,85,61,0.15)] text-[var(--rg-rust)] border border-[var(--rg-rust-dim)]'
                        : review.status === 'hidden'
                        ? 'bg-[rgba(201,154,75,0.15)] text-[var(--rg-brass)]'
                        : 'bg-[rgba(75,156,147,0.15)] text-[var(--rg-teal)]'
                    )}
                  >
                    {review.status}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-[var(--rg-ink)] leading-relaxed bg-[var(--rg-surface-raised)] p-3 rounded-lg border border-[var(--rg-line)]">
                "{review.reviewText}"
              </p>

              {/* Reported Reasons Badge */}
              {review.reportCount > 0 && review.reportReasons && (
                <div className="flex items-center gap-2 text-[11px] text-[var(--rg-rust)] rg-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Reported {review.reportCount} time(s) for: {review.reportReasons.join(', ')}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--rg-line)] text-xs rg-mono">
                <span className="text-[10px] text-[var(--rg-ink-faint)]">ID: {review.id} · {review.createdAt.split('T')[0]}</span>

                <div className="flex items-center gap-2">
                  {review.status === 'flagged' && (
                    <button
                      onClick={() => handleModerate(review.id, 'approve')}
                      disabled={processingId === review.id}
                      className="px-3 py-1 bg-[rgba(75,156,147,0.1)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] rounded hover:bg-[var(--rg-teal)] hover:text-black transition-colors cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss Flag
                    </button>
                  )}

                  {review.status !== 'hidden' ? (
                    <button
                      onClick={() => handleModerate(review.id, 'hide')}
                      disabled={processingId === review.id}
                      className="px-3 py-1 bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] rounded hover:bg-[rgba(201,154,75,0.15)] transition-colors cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <EyeOff className="w-3.5 h-3.5" /> Hide Review
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(review.id, 'approve')}
                      disabled={processingId === review.id}
                      className="px-3 py-1 bg-[rgba(75,156,147,0.1)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] rounded hover:bg-[var(--rg-teal)] hover:text-black transition-colors cursor-pointer font-semibold"
                    >
                      Unhide &amp; Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleModerate(review.id, 'delete')}
                    disabled={processingId === review.id}
                    className="px-3 py-1 bg-[rgba(193,85,61,0.1)] text-[var(--rg-rust)] border border-[var(--rg-rust-dim)] rounded hover:bg-[var(--rg-rust)] hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewModerationPanel;
