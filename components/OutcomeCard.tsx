"use client";

import { useState } from "react";
import { AppMode, MoveOutResult, ListingResult } from "@/types";
import { cn, formatUSD } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Star,
  Copy,
  Check,
  PlusCircle,
  TrendingUp,
  FileText,
  Home,
  Shield,
  Sparkles,
  Scale,
  Zap,
} from "lucide-react";

// ===================== MOVE-OUT AUDIT VIEW =====================

interface MoveOutCardProps {
  result: MoveOutResult;
  imagePreview: string;
  onAddToLog: () => void;
}

function MoveOutAuditCard({ result, onAddToLog }: MoveOutCardProps) {
  const isWear = result.classification === "Normal Wear & Tear";
  const costRange =
    result.repair_cost_low === 0 && result.repair_cost_high === 0
      ? "$0 — Landlord Responsibility ($0 Deduction)"
      : `${formatUSD(result.repair_cost_low)} – ${formatUSD(result.repair_cost_high)}`;

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 backdrop-blur-xl shadow-2xl space-y-0">
      {/* Classification Banner with Neon Glow */}
      <div
        className={cn(
          "px-5 py-4 flex items-center justify-between gap-3 border-b",
          isWear
            ? "bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-slate-950/80 border-emerald-500/40 text-emerald-300"
            : "bg-gradient-to-r from-red-950/80 via-red-900/40 to-slate-950/80 border-red-500/40 text-red-300"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
              isWear
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20"
                : "bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/20"
            )}
          >
            {isWear ? (
              <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <XCircle className="w-6 h-6" strokeWidth={2.5} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold opacity-80">
                AI Defect Classification
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">
              {result.classification}
            </h3>
            <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
              Detected: {result.defect_type}
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex-shrink-0 text-right">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border",
              isWear
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/30 shadow-sm shadow-red-500/20"
            )}
          >
            <Zap className="w-3 h-3" />
            {result.confidence}% Match
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-4">
        {/* Estimated Repair & Deduction Box */}
        <div
          className={cn(
            "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3",
            isWear
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/20 border-red-500/30 text-red-200"
          )}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Estimated Repair Cost / Deposit Impact
            </span>
            <p
              className={cn(
                "text-lg sm:text-xl font-black mt-0.5",
                isWear ? "text-emerald-400" : "text-red-400"
              )}
            >
              {costRange}
            </p>
          </div>

          <span
            className={cn(
              "self-start sm:self-center px-3 py-1 rounded-lg text-xs font-black border",
              isWear
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40"
            )}
          >
            {isWear ? "PROTECTED ($0)" : "DEDUCTIBLE"}
          </span>
        </div>

        {/* Legal Reasoning Box */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Landlord-Tenant Legal Arbitration Basis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {result.legal_reasoning}
          </p>
        </div>

        {/* Confidence Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Model Confidence Level</span>
            <span className="text-white font-mono">{result.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isWear
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_#10b981]"
                  : "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_8px_#ef4444]"
              )}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* Add to Log CTA Button */}
        <button
          onClick={onAddToLog}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Save Defect to Active Inspection Audit Log</span>
        </button>
      </div>
    </div>
  );
}

// ===================== LISTING MODE VIEW =====================

interface ListingCardProps {
  result: ListingResult;
}

function ListingModeCard({ result }: ListingCardProps) {
  const [copied, setCopied] = useState(false);
  const listingText = `${result.headline}\n\n${result.description}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(listingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = listingText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 backdrop-blur-xl shadow-2xl space-y-0">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-slate-950/80 border-b border-emerald-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
              AI Listing Generator
            </span>
            <h3 className="text-base font-black text-white">
              Marketplace Ready Listing
            </h3>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Zillow / FB Ready
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Rent Estimate Box */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Estimated Monthly Market Rent
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
              {formatUSD(result.estimated_monthly_rent)}
              <span className="text-sm font-bold text-emerald-400/60"> /mo</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Fair Market Value
          </span>
        </div>

        {/* Key Features */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AI-Extracted Selling Features
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.key_features.map((feature: string, i: number) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-xs text-slate-300 font-medium"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Listing Headline
          </span>
          <p className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm font-black text-white">
            {result.headline}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Description
          </span>
          <p className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {result.description}
          </p>
        </div>

        {/* Copy CTA */}
        <button
          onClick={handleCopy}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98",
            copied
              ? "bg-emerald-500 text-white shadow-emerald-500/30"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Clipboard! Ready to Paste on Zillow</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Full Listing Text</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ===================== MAIN EXPORT =====================

interface OutcomeCardProps {
  mode: "move_out" | "listing";
  result: MoveOutResult | ListingResult;
  imagePreview: string;
  onAddToLog: () => void;
}

export function OutcomeCard({
  mode,
  result,
  imagePreview,
  onAddToLog,
}: OutcomeCardProps) {
  return (
    <div className="px-4 py-2 max-w-xl mx-auto w-full animate-slide-up">
      {mode === "move_out" ? (
        <MoveOutAuditCard
          result={result as MoveOutResult}
          imagePreview={imagePreview}
          onAddToLog={onAddToLog}
        />
      ) : (
        <ListingModeCard result={result as ListingResult} />
      )}
    </div>
  );
}
