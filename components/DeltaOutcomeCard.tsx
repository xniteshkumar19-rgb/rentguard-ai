"use client";

import { DamageDeltaResult, DeltaDamage } from "@/types";
import { cn, formatUSD } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
  Info,
} from "lucide-react";

interface DeltaOutcomeCardProps {
  result: DamageDeltaResult;
}

function SeverityDot({ severity }: { severity: DeltaDamage["severity"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border",
        severity === "Minor"
          ? "bg-amber-950/40 text-amber-300 border-amber-500/30"
          : severity === "Moderate"
          ? "bg-orange-950/40 text-orange-300 border-orange-500/30"
          : "bg-red-950/60 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
      )}
    >
      {severity}
    </span>
  );
}

export function DeltaOutcomeCard({ result }: DeltaOutcomeCardProps) {
  const isWorsened = result.overall_condition_change === "Worsened";
  const isSame = result.overall_condition_change === "Same";
  const isImproved = result.overall_condition_change === "Improved";

  const ConditionIcon = isWorsened ? TrendingDown : isImproved ? TrendingUp : Minus;
  const hasNewDamages = result.new_damages.length > 0;

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto w-full animate-slide-up">
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 backdrop-blur-xl shadow-2xl space-y-0">
        {/* Classification Header */}
        <div
          className={cn(
            "px-5 py-4 border-b flex items-center justify-between gap-3",
            isWorsened
              ? "bg-gradient-to-r from-red-950/70 to-slate-950/70 border-red-500/30"
              : isSame
              ? "bg-gradient-to-r from-amber-950/50 to-slate-950/70 border-amber-500/30"
              : "bg-gradient-to-r from-emerald-950/70 to-slate-950/70 border-emerald-500/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border flex-shrink-0",
                isWorsened
                  ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-red-500/20"
                  : isSame
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20"
              )}
            >
              <ConditionIcon className="w-6 h-6" strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Damage Delta Analysis — AI Report
              </p>
              <h3 className="text-base font-black text-white">
                Condition {result.overall_condition_change}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-sm">{result.summary}</p>
            </div>
          </div>

          <div className="flex-shrink-0 text-right space-y-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border",
                isWorsened
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : isSame
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              )}
            >
              <Zap className="w-3 h-3" />
              {result.confidence}% Confidence
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Net Deductible Banner */}
          <div
            className={cn(
              "p-4 rounded-xl border flex items-center justify-between gap-4",
              hasNewDamages
                ? "bg-red-950/30 border-red-500/30"
                : "bg-emerald-950/30 border-emerald-500/30"
            )}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Net New Tenant Deductible
              </span>
              <p
                className={cn(
                  "text-2xl font-black mt-0.5",
                  hasNewDamages ? "text-red-400" : "text-emerald-400"
                )}
              >
                {hasNewDamages
                  ? `${formatUSD(result.total_new_deductible_low)} – ${formatUSD(result.total_new_deductible_high)}`
                  : "$0 — Full Deposit Protected"}
              </p>
            </div>
            <span
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-black border self-start",
                hasNewDamages
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              )}
            >
              Liability: {result.tenant_liability}
            </span>
          </div>

          {/* New Damages Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                New Damages (Appeared During Tenancy)
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                {result.new_damages.length} found
              </span>
            </div>

            {result.new_damages.length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                No new damages detected — property returned in move-in condition.
              </div>
            ) : (
              <div className="space-y-2">
                {result.new_damages.map((dmg, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/25 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{dmg.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">📍 {dmg.area}</p>
                      </div>
                      <div className="flex-shrink-0 text-right space-y-1">
                        <SeverityDot severity={dmg.severity} />
                        <p className="text-xs font-black text-red-400 block">
                          {dmg.deductible ? `~${formatUSD(dmg.estimated_cost)}` : "Non-deductible"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-Existing Damages (Landlord Responsibility) */}
          {result.pre_existing_damages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Pre-Existing Damages (Tenant Protected)
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  {result.pre_existing_damages.length} shielded
                </span>
              </div>
              <div className="space-y-2">
                {result.pre_existing_damages.map((dmg, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/25 flex items-start gap-3"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-200">{dmg.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        📍 {dmg.area} — <span className="text-blue-400 font-bold">$0 — Pre-existing, Landlord Responsibility</span>
                      </p>
                    </div>
                    <SeverityDot severity={dmg.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Reasoning */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Scale className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Legal Arbitration Basis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{result.legal_reasoning}</p>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Analysis Confidence</span>
              <span className="text-white font-mono">{result.confidence}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isWorsened
                    ? "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_8px_#ef4444]"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_#10b981]"
                )}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
