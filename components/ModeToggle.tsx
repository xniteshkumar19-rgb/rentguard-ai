"use client";

import { AppMode } from "@/types";
import { cn } from "@/lib/utils";
import { Search, Home, Sparkles, Shield, Camera } from "lucide-react";

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  if (mode === "admin") return null;

  return (
    <div className="px-4 pt-4 pb-2 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Active Vision Model
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
          GPT-4o Multimodal Vision
        </span>
      </div>

      <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 gap-1.5 shadow-xl">
        {/* Sliding neon background glow indicator */}
        <div
          className={cn(
            "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-out shadow-lg",
            mode === "move_out"
              ? "left-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 border border-blue-400/30"
              : "left-[calc(50%+3px)] bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 border border-emerald-400/30"
          )}
        />

        {/* Move-Out Audit Button */}
        <button
          onClick={() => onChange("move_out")}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200",
            mode === "move_out"
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          )}
          aria-pressed={mode === "move_out"}
        >
          <Shield className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          <span className="truncate">Move-Out Audit (Deposit)</span>
        </button>

        {/* Listing Mode Button */}
        <button
          onClick={() => onChange("listing")}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-colors duration-200",
            mode === "listing"
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          )}
          aria-pressed={mode === "listing"}
        >
          <Home className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          <span className="truncate">Rent / Sale Listing AI</span>
        </button>
      </div>

      {/* Contextual description pill */}
      <p className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        {mode === "move_out" ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Photograph scuffs, stains, or damage for instant deposit deduction audit</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Photograph a room to auto-extract features, rent value, & Zillow copy</span>
          </>
        )}
      </p>
    </div>
  );
}
