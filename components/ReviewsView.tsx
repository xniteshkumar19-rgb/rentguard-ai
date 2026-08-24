'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Star,
  ShieldCheck,
  Building,
  CheckCircle2,
  ExternalLink,
  Filter,
  Plus,
  ArrowUpDown,
  Flag,
  Sparkles,
  Info,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Review,
  ReviewProperty,
  PropertyReviewSummary,
  ReviewSource,
  PropertyType,
} from '@/types';
import { INITIAL_PROPERTIES } from '@/lib/reviewsData';
import { WriteReviewModal } from './WriteReviewModal';
import { ReportReviewModal } from './ReportReviewModal';
import { ReviewModerationPanel } from './ReviewModerationPanel';

interface ReviewsViewProps {
  userPersona?: 'tenant' | 'manager';
  currentUser?: { name: string; email: string };
}

export function ReviewsView({
  userPersona = 'tenant',
  currentUser = { name: 'Aditi Sharma', email: 'aditi.sharma@rentguard.ai' },
}: ReviewsViewProps) {
  const [properties, setProperties] = useState<ReviewProperty[]>(INITIAL_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(INITIAL_PROPERTIES[0].id);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<PropertyReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [sourceFilter, setSourceFilter] = useState<ReviewSource | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const [showModerationQueue, setShowModerationQueue] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Fetch reviews and property summaries
  const fetchReviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        propertyId: selectedPropertyId,
        source: sourceFilter,
        sort: sortOrder,
        verifiedOnly: verifiedOnly ? 'true' : 'false',
        status: 'approved',
      });

      const res = await fetch(`/api/reviews?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setSummary(data.summary || null);
        if (data.properties) {
          setProperties(data.properties);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId, sourceFilter, sortOrder, verifiedOnly]);

  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  const filteredProperties = useMemo(() => {
    if (typeFilter === 'ALL') return properties;
    return properties.filter((p) => p.type === typeFilter);
  }, [properties, typeFilter]);

  const isManager = userPersona === 'manager';

  return (
    <div className="space-y-10 py-4">
      {/* ── Top Header & Action Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rg-line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rg-mono text-[11px] px-2.5 py-1 border border-[var(--rg-teal-dim)] text-[var(--rg-teal)] bg-[rgba(75,156,147,0.12)] rounded-sm">
              DUAL-SOURCE REVIEWS &amp; TRUST LEDGER
            </span>
            <span className="text-[10px] rg-mono text-[var(--rg-brass)] bg-[rgba(201,154,75,0.1)] px-2 py-0.5 rounded border border-[var(--rg-brass-dim)]">
              HOTELS &amp; PGS
            </span>
          </div>
          <h2 className="rg-display text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] mt-2">
            Hotel &amp; PG Community &amp; Google Reviews
          </h2>
          <p className="text-xs text-[var(--rg-ink-dim)] mt-1">
            Independent review provenance: Google Business Profile ratings and first-party verified RentGuard tenancy reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isManager && (
            <button
              onClick={() => setShowModerationQueue((v) => !v)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-bold rg-mono flex items-center gap-2 transition-all cursor-pointer border',
                showModerationQueue
                  ? 'bg-[var(--rg-rust)] text-white border-[var(--rg-rust)]'
                  : 'bg-[var(--rg-surface-raised)] text-[var(--rg-rust)] border-[var(--rg-rust-dim)] hover:bg-[var(--rg-surface)]'
              )}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{showModerationQueue ? 'Hide Moderation' : 'Moderation Queue'}</span>
            </button>
          )}

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="px-5 py-2.5 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold text-xs rg-mono rounded-xl shadow-[0_0_20px_rgba(201,154,75,0.3)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* ── Admin Moderation Panel Drawer ── */}
      {showModerationQueue && (
        <div className="animate-in fade-in zoom-in-95">
          <ReviewModerationPanel reviews={reviews} onRefresh={fetchReviewData} />
        </div>
      )}

      {/* ── Property Category & Selector Carousel ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs rg-mono">
            <span className="text-[var(--rg-ink-faint)] uppercase font-bold">Category:</span>
            {(['ALL', 'PG', 'HOTEL'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setTypeFilter(cat)}
                className={cn(
                  'px-3 py-1 rounded-lg border transition-all cursor-pointer font-semibold',
                  typeFilter === cat
                    ? 'bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border-[var(--rg-brass-dim)]'
                    : 'bg-[var(--rg-surface)] text-[var(--rg-ink-dim)] border-[var(--rg-line)] hover:text-[var(--rg-ink)]'
                )}
              >
                {cat === 'ALL' ? 'All Accommodations' : cat === 'PG' ? 'Co-living PGs' : 'Hotels & Suites'}
              </button>
            ))}
          </div>

          <span className="text-xs rg-mono text-[var(--rg-ink-faint)]">
            Showing {filteredProperties.length} Properties
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProperties.map((prop) => {
            const isSelected = prop.id === selectedPropertyId;
            return (
              <div
                key={prop.id}
                onClick={() => setSelectedPropertyId(prop.id)}
                className={cn(
                  'p-4 rounded-2xl border bg-[var(--rg-surface)] space-y-3 cursor-pointer transition-all rg-lift',
                  isSelected
                    ? 'border-2 border-[var(--rg-brass)] shadow-[0_0_20px_rgba(201,154,75,0.2)] bg-[var(--rg-surface-raised)]'
                    : 'border-[var(--rg-line-strong)] hover:border-[var(--rg-brass-dim)]'
                )}
              >
                <div className="relative h-32 rounded-xl overflow-hidden border border-[var(--rg-line)]">
                  <img src={prop.image} alt={prop.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[9px] rg-mono font-bold text-[var(--rg-brass)] border border-[var(--rg-brass-dim)]">
                    {prop.type}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] rg-mono font-bold text-[var(--rg-ink)]">
                    {prop.pricePerMonthOrNight}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--rg-ink)] line-clamp-1">{prop.name}</h4>
                  <p className="text-[11px] text-[var(--rg-ink-dim)] line-clamp-1 mt-0.5">{prop.location}</p>
                </div>

                <div className="pt-2 border-t border-[var(--rg-line)] flex items-center justify-between text-xs rg-mono">
                  <span className="text-[10px] text-[var(--rg-ink-faint)]">Verified Hub</span>
                  <span className="text-[var(--rg-brass)] font-bold flex items-center gap-1">
                    Select <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selected Property Banner & Dual Rating Cards ── */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--rg-line-strong)] bg-gradient-to-b from-[var(--rg-surface-raised)] to-[var(--rg-surface)] shadow-2xl space-y-6 rg-glass-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--rg-line)]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] rg-mono font-bold rounded bg-[var(--rg-brass)] text-black uppercase">
                {selectedProperty.type}
              </span>
              <span className="text-xs rg-mono text-[var(--rg-ink-faint)]">ID: {selectedProperty.id}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] rg-display">
              {selectedProperty.name}
            </h3>
            <p className="text-xs rg-mono text-[var(--rg-ink-dim)]">{selectedProperty.address}</p>
          </div>

          {selectedProperty.googleMapsUrl && (
            <a
              href={selectedProperty.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--rg-surface)] hover:bg-[var(--rg-surface-raised)] border border-[var(--rg-line-strong)] text-[var(--rg-ink)] text-xs rg-mono rounded-xl transition-all w-fit"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>View on Google Maps</span>
              <ExternalLink className="w-3 h-3 text-[var(--rg-ink-faint)]" />
            </a>
          )}
        </div>

        {/* ── Separate Provenance Rating Cards (NEVER BLENDED) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: RentGuard First-Party Rating */}
          <div className="p-6 rounded-2xl border-2 border-[var(--rg-brass-dim)] bg-[rgba(201,154,75,0.04)] space-y-4 rg-glass-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[rgba(201,154,75,0.15)] text-[var(--rg-brass)] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase rg-mono text-[var(--rg-brass)]">
                  RentGuard Verified Rating
                </span>
              </div>
              <span className="text-[10px] rg-mono px-2 py-0.5 bg-[rgba(75,156,147,0.12)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] rounded">
                FIRST-PARTY SOURCE
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-[var(--rg-brass)] rg-mono">
                {summary?.rentGuardRating ? summary.rentGuardRating.toFixed(1) : '5.0'}
              </span>
              <div>
                <div className="flex items-center gap-1 text-[var(--rg-brass)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--rg-brass)]" />
                  ))}
                </div>
                <span className="text-xs rg-mono text-[var(--rg-ink-dim)] mt-0.5 block">
                  Based on {summary?.rentGuardReviewCount || 0} RentGuard reviews ({summary?.verifiedReviewCount || 0} verified stays)
                </span>
              </div>
            </div>

            {/* Star distribution */}
            {summary?.ratingDistribution && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--rg-line)] text-xs rg-mono">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
                  const pct = summary.rentGuardReviewCount > 0 ? (count / summary.rentGuardReviewCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[11px]">
                      <span className="w-6 text-[var(--rg-ink-faint)]">{star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--rg-bg)] overflow-hidden border border-[var(--rg-line)]">
                        <div className="h-full bg-[var(--rg-brass)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-[var(--rg-ink-dim)]">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Google Places Rating */}
          <div className="p-6 rounded-2xl border-2 border-blue-500/30 bg-[rgba(59,130,246,0.04)] space-y-4 rg-glass-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                  G
                </div>
                <span className="text-xs font-bold uppercase rg-mono text-blue-400">
                  Google Business Rating
                </span>
              </div>
              <span className="text-[10px] rg-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                EXTERNAL READ-ONLY
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-blue-400 rg-mono">
                {summary?.googleRating ? summary.googleRating.toFixed(1) : '4.4'}
              </span>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs rg-mono text-[var(--rg-ink-dim)] mt-0.5 block">
                  Based on {summary?.googleReviewCount || 238} Google Places reviews
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--rg-surface)] border border-[var(--rg-line)] text-[11px] text-[var(--rg-ink-dim)] space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold rg-mono">
                <Info className="w-3.5 h-3.5" /> Official Google API Integration
              </div>
              <p>
                Google reviews are pulled from official Google Places API endpoints. They remain strictly read-only inside RentGuard to maintain provenance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="p-4 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] flex flex-wrap items-center justify-between gap-4 rg-glass-3">
        {/* Source Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--rg-surface-raised)] border border-[var(--rg-line)] rounded-xl text-xs rg-mono">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer',
              sourceFilter === 'ALL'
                ? 'bg-[var(--rg-brass)] text-black font-bold shadow-md'
                : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
            )}
          >
            All Sources ({reviews.length})
          </button>
          <button
            onClick={() => setSourceFilter('RENTGUARD')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer flex items-center gap-1.5',
              sourceFilter === 'RENTGUARD'
                ? 'bg-[var(--rg-brass)] text-black font-bold shadow-md'
                : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            RentGuard ({reviews.filter((r) => r.source === 'RENTGUARD').length})
          </button>
          <button
            onClick={() => setSourceFilter('GOOGLE')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer flex items-center gap-1.5',
              sourceFilter === 'GOOGLE'
                ? 'bg-[var(--rg-brass)] text-black font-bold shadow-md'
                : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            Google ({reviews.filter((r) => r.source === 'GOOGLE').length})
          </button>
        </div>

        {/* Right Tools: Sort & Verified Only Filter */}
        <div className="flex items-center gap-3 text-xs rg-mono">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[var(--rg-surface-raised)] border border-[var(--rg-line)] rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-[var(--rg-teal)]"
            />
            <span className="text-[var(--rg-teal)] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Stays Only
            </span>
          </label>

          <div className="flex items-center gap-1.5 bg-[var(--rg-surface-raised)] border border-[var(--rg-line)] px-3 py-1.5 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--rg-ink-faint)]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent text-[var(--rg-ink)] outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#101413]">Newest First</option>
              <option value="highest" className="bg-[#101413]">Highest Rating</option>
              <option value="lowest" className="bg-[#101413]">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Review Cards List ── */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-xs rg-mono text-[var(--rg-brass)] animate-pulse">
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-[var(--rg-line-strong)] bg-[var(--rg-surface)]">
            <MessageSquare className="w-8 h-8 mx-auto text-[var(--rg-ink-faint)]" />
            <p className="text-sm font-bold text-[var(--rg-ink)]">No reviews found matching current filters.</p>
            <p className="text-xs text-[var(--rg-ink-dim)]">Try adjusting your filters or be the first to write a review!</p>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="mt-2 px-4 py-2 bg-[var(--rg-brass)] text-black font-bold text-xs rg-mono rounded-lg cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Write Review
            </button>
          </div>
        ) : (
          reviews.map((review) => {
            const isGoogle = review.source === 'GOOGLE';
            return (
              <div
                key={review.id}
                className={cn(
                  'p-6 rounded-2xl border bg-[var(--rg-surface)] space-y-4 shadow-xl transition-all rg-glass-2 rg-glass-hover',
                  isGoogle
                    ? 'border-blue-500/20 hover:border-blue-500/40'
                    : 'border-[var(--rg-line-strong)] hover:border-[var(--rg-brass-dim)]'
                )}
              >
                {/* Header Row: Reviewer Info & Source Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {review.reviewerImage ? (
                      <img
                        src={review.reviewerImage}
                        alt={review.reviewerName}
                        className="w-10 h-10 rounded-full object-cover border border-[var(--rg-line-strong)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--rg-surface-raised)] border border-[var(--rg-line-strong)] flex items-center justify-center font-bold text-sm text-[var(--rg-brass)]">
                        {review.reviewerName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[var(--rg-ink)]">{review.reviewerName}</h4>
                        {review.verifiedStay && (
                          <span className="text-[10px] rg-mono px-2 py-0.5 rounded-full bg-[rgba(75,156,147,0.15)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(75,156,147,0.2)]">
                            <CheckCircle2 className="w-3 h-3" /> Verified Guest
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--rg-ink-dim)] rg-mono">
                        {review.stayDate} {review.roomType ? `· ${review.roomType}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Source Badge & Star Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[var(--rg-brass)]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < review.rating ? 'fill-[var(--rg-brass)] text-[var(--rg-brass)]' : 'text-[var(--rg-line)]'
                          )}
                        />
                      ))}
                    </div>

                    {isGoogle ? (
                      <span className="text-[10px] rg-mono font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Google Review
                      </span>
                    ) : (
                      <span className="text-[10px] rg-mono font-bold px-2.5 py-1 rounded bg-[rgba(201,154,75,0.12)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> RentGuard Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Body Text */}
                <p className="text-xs sm:text-sm text-[var(--rg-ink)] leading-relaxed bg-[var(--rg-surface-raised)]/50 p-4 rounded-xl border border-[var(--rg-line)]">
                  "{review.reviewText}"
                </p>

                {/* Attached Photo Gallery */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {review.photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setActivePhotoModal(photo)}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--rg-line-strong)] hover:border-[var(--rg-brass)] cursor-pointer transition-all"
                      >
                        <img src={photo} alt="Attached review photo" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer: Date & Report Action */}
                <div className="pt-2 border-t border-[var(--rg-line)] flex items-center justify-between text-xs rg-mono text-[var(--rg-ink-faint)]">
                  <span>Published on {review.createdAt.split('T')[0]}</span>

                  {!isGoogle ? (
                    <button
                      onClick={() => setReportingReview(review)}
                      className="text-[var(--rg-rust)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report Review</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-[var(--rg-ink-faint)] italic">
                      Synced via Google Places API · Read-only
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modals ── */}
      {isWriteModalOpen && (
        <WriteReviewModal
          properties={properties}
          selectedProperty={selectedProperty}
          onClose={() => setIsWriteModalOpen(false)}
          onSubmitSuccess={() => fetchReviewData()}
          currentUser={currentUser}
        />
      )}

      {reportingReview && (
        <ReportReviewModal
          review={reportingReview}
          onClose={() => setReportingReview(null)}
          onReportSuccess={() => fetchReviewData()}
        />
      )}

      {/* Photo Enlarge Lightbox */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={activePhotoModal}
            alt="Enlarged review photo"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-[var(--rg-brass-dim)] shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default ReviewsView;
