'use client';

import { useState } from 'react';
import {
  Home,
  Upload,
  Sparkles,
  Copy,
  Check,
  Coins,
  FileText,
  Tag,
  Building,
  ArrowRight,
  Eye,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { cn, formatINR, fileToBase64, fileToDataURL } from '@/lib/utils';
import { ListingResult } from '@/types';
import { MOCK_LISTING_RESULTS } from '@/lib/mockData';

export function ListingGeneratorView() {
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [listingData, setListingData] = useState<ListingResult>(MOCK_LISTING_RESULTS[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleGenerateListing = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 1000));
    const randomListing =
      MOCK_LISTING_RESULTS[Math.floor(Math.random() * MOCK_LISTING_RESULTS.length)];
    setListingData(randomListing);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    const textToCopy = `${listingData.headline}\n\nRent: ₹${listingData.estimated_monthly_rent.toLocaleString('en-IN')}/month\n\n${listingData.description}\n\nKey Features:\n${listingData.key_features.map((f) => `• ${f}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 py-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rg-line)] pb-5">
        <div>
          <span className="rg-mono text-[11px] px-2.5 py-1 border border-[var(--rg-brass-dim)] text-[var(--rg-brass)] bg-[var(--rg-brass-dim)]/20 rounded-sm">
            SECONDARY ENGINE · LISTING GENERATOR
          </span>
          <h2 className="rg-display text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] mt-2">
            Turn Your Room Photos into a Listing
          </h2>
        </div>

        <button
          onClick={handleGenerateListing}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold text-xs rg-mono rounded-lg shadow-[0_0_20px_rgba(201,154,75,0.3)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGenerating ? 'AI Extracting Features…' : 'Generate Listing Copy'}</span>
        </button>
      </div>

      {/* ── 2-Column Grid: Upload Photo Left, Generated Copy Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Photo Upload & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--rg-ink)] rg-display uppercase">
              Upload Clean Room Photography
            </h3>

            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-[var(--rg-line)] bg-black">
              <img src={selectedImage} alt="Room" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/80 rounded text-[10px] rg-mono text-[var(--rg-teal)] border border-[var(--rg-teal-dim)]">
                TARGET ASSET
              </span>
            </div>

            <label className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] border border-dashed border-[var(--rg-brass-dim)] text-[var(--rg-brass)] text-xs font-bold rg-mono rounded-xl cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Upload Custom Room Photo</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Right: AI Extracted Listing Result */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 sm:p-8 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--rg-line)]">
              <div>
                <span className="text-[10px] rg-mono font-bold text-[var(--rg-teal)] uppercase">
                  AI PROPERTY COPYWRITER
                </span>
                <h3 className="text-xl font-bold text-[var(--rg-ink)] mt-0.5">
                  Extracted Listing Asset
                </h3>
              </div>

              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] rounded-lg text-xs font-bold rg-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--rg-teal)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Listing'}</span>
              </button>
            </div>

            {/* Estimated Rent Badge */}
            <div className="p-4 rounded-xl bg-[rgba(201,154,75,0.08)] border border-[var(--rg-brass-dim)] flex items-center justify-between">
              <div>
                <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] uppercase font-bold">
                  AI ESTIMATED MONTHLY RENT
                </span>
                <div className="text-2xl font-bold text-[var(--rg-brass)] rg-mono">
                  {formatINR(listingData.estimated_monthly_rent)}
                  <span className="text-xs text-[var(--rg-ink-dim)] font-normal"> / month</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[var(--rg-brass)] text-black text-[10px] rg-mono font-bold rounded">
                MARKET CALIBRATED
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase rg-mono text-[var(--rg-ink-dim)]">
                LISTING HEADLINE:
              </span>
              <h4 className="text-base font-bold text-[var(--rg-ink)] bg-[var(--rg-surface-raised)] p-3.5 rounded-xl border border-[var(--rg-line)]">
                {listingData.headline}
              </h4>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase rg-mono text-[var(--rg-ink-dim)]">
                MARKETING DESCRIPTION:
              </span>
              <p className="text-xs text-[var(--rg-ink)] leading-relaxed bg-[var(--rg-surface-raised)] p-4 rounded-xl border border-[var(--rg-line)]">
                {listingData.description}
              </p>
            </div>

            {/* Key Features Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase rg-mono text-[var(--rg-ink-dim)]">
                EXTRACTED AMENITIES &amp; FEATURES:
              </span>
              <div className="flex flex-wrap gap-2">
                {listingData.key_features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rg-mono bg-[rgba(75,156,147,0.1)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] rounded-lg font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingGeneratorView;
