"use client";

import { AppMode } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Shield,
  Home,
  ArrowLeftRight,
  Cpu,
} from "lucide-react";

interface LoadingPulseProps {
  mode: AppMode;
}

const MOVE_OUT_STEPS = [
  { text: "Ingesting high-resolution image telemetry…", code: "IMG_DECODE" },
  { text: "Running surface defect edge segmentation…", code: "SEGMENTATION" },
  { text: "Applying statutory Wear & Tear arbitration rules…", code: "LEGAL_RULES" },
  { text: "Estimating local market repair depreciation…", code: "COST_ESTIMATE" },
  { text: "Enforcing strict JSON legal audit payload…", code: "SCHEMA_VALIDATE" },
];

const LISTING_STEPS = [
  { text: "Extracting architectural room elements…", code: "FEATURE_EXTRACT" },
  { text: "Analyzing natural lighting & finish quality…", code: "FINISH_ANALYZE" },
  { text: "Calculating local rental market comp value…", code: "RENT_APPRAISAL" },
  { text: "Synthesizing high-converting Zillow copy…", code: "NLP_COPYWRITER" },
  { text: "Formatting marketing headline & description…", code: "JSON_PAYLOAD" },
];

const DELTA_STEPS = [
  { text: "Decoding move-in & move-out image pair…", code: "IMG_PAIR_DECODE" },
  { text: "Aligning spatial features across both photos…", code: "SPATIAL_ALIGN" },
  { text: "Detecting new damage not present at move-in…", code: "DAMAGE_DELTA" },
  { text: "Applying Wear & Tear exclusions to new damage…", code: "LEGAL_DELTA" },
  { text: "Calculating net tenant deductible range…", code: "DEDUCTIBLE_CALC" },
];

export function LoadingPulse({ mode }: LoadingPulseProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [latencyCounter, setLatencyCounter] = useState(120);

  const steps =
    mode === "move_out"
      ? MOVE_OUT_STEPS
      : mode === "delta"
      ? DELTA_STEPS
      : LISTING_STEPS;

  const isAuditMode = mode === "move_out";
  const isDeltaMode = mode === "delta";

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1100);

    const latencyInterval = setInterval(() => {
      setLatencyCounter((prev) => prev + 18);
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(latencyInterval);
    };
  }, [mode, steps.length]);

  const accentColors = isDeltaMode
    ? "text-purple-400 bg-purple-500/20 border-purple-500/30"
    : isAuditMode
    ? "text-indigo-400 bg-indigo-500/20 border-indigo-500/30"
    : "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";

  const barColors = isDeltaMode
    ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_#a855f7]"
    : isAuditMode
    ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_#3b82f6]"
    : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_#10b981]";

  return (
    <div className="px-4 py-3 max-w-xl mx-auto w-full animate-slide-up">
      <div className="rounded-2xl p-5 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 space-y-4">
        {/* Top HUD Telemetry Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400 animate-spin [animation-duration:4s]" />
            <span className="text-xs font-black text-white tracking-wide uppercase">
              {isDeltaMode ? "Delta Analysis Active" : "Vision ML Inference Active"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", accentColors)}>
              {latencyCounter}ms
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GPT-4o Vision
            </span>
          </div>
        </div>

        {/* Central Pulsing Hologram */}
        <div className="flex items-center gap-4 py-1">
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="absolute inset-1.5 rounded-full bg-purple-500/30 animate-pulse" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 border border-white/20">
              {isDeltaMode ? (
                <ArrowLeftRight className="w-5 h-5" />
              ) : isAuditMode ? (
                <Shield className="w-5 h-5" />
              ) : (
                <Home className="w-5 h-5" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                STEP {stepIndex + 1}/5
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                [{steps[stepIndex].code}]
              </span>
            </div>
            <p
              key={stepIndex}
              className="text-xs sm:text-sm font-extrabold text-white animate-fade-in truncate"
            >
              {steps[stepIndex].text}
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i <= stepIndex ? barColors : "bg-slate-800"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
