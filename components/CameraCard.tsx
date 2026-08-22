"use client";

import { useRef, ChangeEvent } from "react";
import { AppMode } from "@/types";
import { cn } from "@/lib/utils";
import {
  Camera,
  Upload,
  X,
  ScanLine,
  Sparkles,
  Zap,
  Crosshair,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

interface CameraCardProps {
  mode: AppMode;
  imagePreview: string | null;
  isLoading: boolean;
  onImageSelect: (file: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
}

// Sample mock base64/SVG images for quick 1-click test by Hackathon judges
const SAMPLE_DAMAGE_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'><rect width='640' height='400' fill='%231e293b'/><rect x='40' y='40' width='560' height='320' fill='%23334155' rx='12'/><path d='M180 140 Q 240 220 320 180 T 460 260' stroke='%23ef4444' stroke-width='8' fill='none' stroke-dasharray='10 5'/><circle cx='280' cy='190' r='35' fill='%23dc2626' opacity='0.3'/><text x='320' y='320' fill='%23f8fafc' font-size='20' font-weight='bold' text-anchor='middle' font-family='sans-serif'>Simulated Wall Damage &amp; Impact Scuff</text></svg>";

const SAMPLE_ROOM_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'><rect width='640' height='400' fill='%230f172a'/><rect x='40' y='40' width='560' height='320' fill='%231e293b' rx='12'/><rect x='100' y='80' width='140' height='160' fill='%2338bdf8' opacity='0.4' rx='8'/><rect x='340' y='140' width='220' height='120' fill='%2310b981' opacity='0.3' rx='8'/><text x='320' y='320' fill='%23f8fafc' font-size='20' font-weight='bold' text-anchor='middle' font-family='sans-serif'>Simulated Modern Living Room &amp; Granite Kitchen</text></svg>";

export function CameraCard({
  mode,
  imagePreview,
  isLoading,
  onImageSelect,
  onClear,
  onAnalyze,
}: CameraCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Quick 1-click sample image loader for hackathon judges
  const handleLoadSample = async () => {
    const sampleUrl = mode === "move_out" ? SAMPLE_DAMAGE_SVG : SAMPLE_ROOM_SVG;
    const res = await fetch(sampleUrl);
    const blob = await res.blob();
    const file = new File(
      [blob],
      mode === "move_out" ? "sample_wall_damage.svg" : "sample_modern_room.svg",
      { type: "image/svg+xml" }
    );
    onImageSelect(file);
  };

  const isAuditMode = mode === "move_out";

  return (
    <div className="px-4 py-2 max-w-xl mx-auto w-full space-y-2.5">
      {/* Viewfinder Card */}
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xl",
          imagePreview
            ? "border-slate-700 bg-slate-900/90"
            : isAuditMode
            ? "border-blue-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-blue-950/20 hover:border-blue-500/60"
            : "border-emerald-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-emerald-950/20 hover:border-emerald-500/60"
        )}
      >
        {/* Holographic Corner Viewfinder Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400/60 rounded-tl pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400/60 rounded-tr pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400/60 rounded-bl pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400/60 rounded-br pointer-events-none z-20" />

        {/* Image Preview & Active Viewfinder */}
        {imagePreview ? (
          <div className="relative">
            <div className="relative w-full aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
              <Image
                src={imagePreview}
                alt="Selected inspection photo"
                fill
                className="object-cover"
                unoptimized
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Scanning laser line animation when analyzing */}
              {isLoading && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan-laser absolute" />
                  <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px]" />
                </div>
              )}

              {/* Viewfinder Target Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <Crosshair className="w-12 h-12 text-indigo-300" strokeWidth={1} />
              </div>
            </div>

            {/* Clear button */}
            {!isLoading && (
              <button
                onClick={onClear}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-lg z-30"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Empty State — Holographic Camera Trigger */
          <div className="py-10 px-6 flex flex-col items-center text-center gap-3 group">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-18 h-18 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-105 border",
                isAuditMode
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400 group-hover:border-blue-400 group-hover:shadow-blue-500/20"
                  : "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20"
              )}
            >
              <Camera className="w-9 h-9" strokeWidth={1.5} />
            </button>

            <div>
              <p className="font-extrabold text-base text-white">
                {isAuditMode ? "Capture Damage Photo" : "Capture Room Photo"}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {isAuditMode
                  ? "Snap scuffs, stains, chipped paint, or broken hardware"
                  : "Snap a staged room, kitchen, or living area for listing generation"}
              </p>
            </div>

            {/* Quick Sample Trigger for Hackathon Judges */}
            <div className="pt-2">
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Judge Quick-Test: Load Sample {isAuditMode ? "Damage" : "Room"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all disabled:opacity-40"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          <button
            onClick={onAnalyze}
            disabled={!imagePreview || isLoading}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black text-white transition-all duration-300 shadow-xl",
              !imagePreview || isLoading
                ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                : isAuditMode
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 border border-blue-400/30 active:scale-98"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25 border border-emerald-400/30 active:scale-98"
            )}
          >
            <ScanLine className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span>
              {isLoading
                ? "Running Vision AI Inference..."
                : isAuditMode
                ? "Run Damage Audit (GPT-4o)"
                : "Generate Listing Copy (GPT-4o)"}
            </span>
          </button>
        </div>
      </div>

      {/* Hidden native input with environment capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
