'use client';

import { useState } from 'react';
import {
  X,
  Star,
  Camera,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReviewProperty, CreateReviewInput } from '@/types';

interface WriteReviewModalProps {
  properties: ReviewProperty[];
  selectedProperty: ReviewProperty;
  onClose: () => void;
  onSubmitSuccess: () => void;
  currentUser?: { name: string; email: string };
}

export function WriteReviewModal({
  properties,
  selectedProperty,
  onClose,
  onSubmitSuccess,
  currentUser,
}: WriteReviewModalProps) {
  const [propertyId, setPropertyId] = useState(selectedProperty.id);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [roomType, setRoomType] = useState('Standard Room / PG Suite');
  const [stayDate, setStayDate] = useState('August 2026');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeProperty = properties.find((p) => p.id === propertyId) || selectedProperty;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
      setPhotos((prev) => [...prev, ...newUrls].slice(0, 4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setErrorMessage('Please enter at least 5 characters for your review.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateReviewInput = {
        propertyId,
        rating,
        reviewText: reviewText.trim(),
        reviewerName: currentUser?.name || 'Verified RentGuard Guest',
        roomType,
        stayDate,
        photos,
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[var(--rg-surface)] border-2 border-[var(--rg-brass-dim)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--rg-ink-faint)] hover:text-[var(--rg-ink)] p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <span className="text-[10px] rg-mono font-bold tracking-widest text-[var(--rg-brass)] uppercase">
            FIRST-PARTY REVIEW
          </span>
          <h3 className="text-2xl font-bold text-[var(--rg-ink)] rg-display mt-0.5">
            Write a RentGuard Review
          </h3>
          <p className="text-xs text-[var(--rg-ink-dim)]">
            Share your authentic experience to help fellow tenants and guests make informed decisions.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[rgba(193,85,61,0.12)] border border-[var(--rg-rust-dim)] text-[var(--rg-rust)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Selector */}
          <div className="space-y-1.5">
            <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium">Select Hotel / PG:</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full bg-[var(--rg-surface-raised)] border border-[var(--rg-line-strong)] px-3.5 py-2.5 text-xs rg-mono text-[var(--rg-ink)] rounded-xl outline-none focus:border-[var(--rg-brass)]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.type}] {p.name} — {p.location}
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-1.5">
            <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium">Overall Rating:</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-[var(--rg-brass)] hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={cn(
                      'w-7 h-7',
                      (hoverRating !== null ? hoverRating >= star : rating >= star)
                        ? 'fill-[var(--rg-brass)] text-[var(--rg-brass)]'
                        : 'text-[var(--rg-line-strong)]'
                    )}
                  />
                </button>
              ))}
              <span className="text-xs font-bold rg-mono text-[var(--rg-brass)] ml-2">
                {rating}.0 / 5.0
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium">Written Feedback:</label>
              <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)]">
                {reviewText.length} characters
              </span>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was your stay? Mention room cleanliness, amenities, Wi-Fi, food, warden behavior, or security deposit experience..."
              rows={4}
              className="w-full bg-[var(--rg-bg)] border border-[var(--rg-line-strong)] p-3.5 text-xs text-[var(--rg-ink)] rounded-xl outline-none focus:border-[var(--rg-brass)] resize-none"
            />
          </div>

          {/* Room Type & Stay Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs rg-mono text-[var(--rg-ink-dim)]">Room / Accommodation Type:</label>
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="e.g. Single Occupancy Room 204"
                className="w-full bg-[var(--rg-bg)] border border-[var(--rg-line-strong)] px-3 py-2 text-xs rg-mono text-[var(--rg-ink)] rounded-lg outline-none focus:border-[var(--rg-brass)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs rg-mono text-[var(--rg-ink-dim)]">Date of Stay:</label>
              <input
                type="text"
                value={stayDate}
                onChange={(e) => setStayDate(e.target.value)}
                placeholder="e.g. Aug 2025 – Jul 2026"
                className="w-full bg-[var(--rg-bg)] border border-[var(--rg-line-strong)] px-3 py-2 text-xs rg-mono text-[var(--rg-ink)] rounded-lg outline-none focus:border-[var(--rg-brass)]"
              />
            </div>
          </div>

          {/* Photo Upload Attachment */}
          <div className="space-y-1.5">
            <label className="text-xs rg-mono text-[var(--rg-ink-dim)]">Attach Photos (Optional):</label>
            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--rg-teal-dim)] rounded-xl bg-[var(--rg-surface-raised)] cursor-pointer hover:bg-[var(--rg-surface)] transition-colors text-xs rg-mono text-[var(--rg-teal)]">
              <Camera className="w-4 h-4" />
              <span>Upload Room or Property Photos</span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            {photos.length > 0 && (
              <div className="flex gap-2 pt-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-[var(--rg-teal)]">
                    <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Stay Notice */}
          <div className="p-3 rounded-xl bg-[rgba(75,156,147,0.08)] border border-[var(--rg-teal-dim)] flex items-start gap-2.5 text-[11px] text-[var(--rg-ink-dim)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--rg-teal)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--rg-teal)]">Verified Stay Integration:</strong> If your RentGuard account has an active tenancy or completed inspection record for this property, your review will automatically feature the green <strong>Verified Guest</strong> badge.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[var(--rg-surface-raised)] text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] border border-[var(--rg-line-strong)] rounded-xl text-xs font-bold rg-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold text-xs rg-mono rounded-xl shadow-[0_0_15px_rgba(201,154,75,0.3)] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting…' : 'Publish Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteReviewModal;
