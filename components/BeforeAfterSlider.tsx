"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Camera, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// Sample SVGs for quick demo testing by hackathon judges
const BEFORE_DEMO_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect width='640' height='420' fill='%230f172a'/><rect x='30' y='30' width='580' height='360' fill='%231e293b' rx='16'/><rect x='80' y='80' width='200' height='120' fill='%2338bdf8' opacity='0.25' rx='8'/><rect x='360' y='100' width='220' height='100' fill='%2310b981' opacity='0.2' rx='8'/><text x='320' y='290' fill='%2394a3b8' font-size='16' font-weight='bold' text-anchor='middle' font-family='sans-serif'>MOVE-IN: Clean condition. No visible damage.</text><text x='320' y='320' fill='%2364748b' font-size='13' text-anchor='middle' font-family='sans-serif'>Pristine walls, intact tiles, fresh paint</text></svg>";

const AFTER_DEMO_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect width='640' height='420' fill='%230f172a'/><rect x='30' y='30' width='580' height='360' fill='%231e293b' rx='16'/><rect x='80' y='80' width='200' height='120' fill='%2338bdf8' opacity='0.25' rx='8'/><rect x='360' y='100' width='220' height='100' fill='%2310b981' opacity='0.2' rx='8'/><circle cx='260' cy='170' r='30' fill='%23ef4444' opacity='0.35'/><path d='M380 240 Q 400 210 420 240' stroke='%23ef4444' stroke-width='6' fill='none'/><text x='320' y='290' fill='%23f87171' font-size='16' font-weight='bold' text-anchor='middle' font-family='sans-serif'>MOVE-OUT: New damage identified.</text><text x='320' y='320' fill='%2364748b' font-size='13' text-anchor='middle' font-family='sans-serif'>Wall gouge near hallway + cracked bathroom tile</text></svg>";

interface BeforeAfterSliderProps {
  beforeImage: string | null;
  afterImage: string | null;
  onBeforeSelect: (file: File) => void;
  onAfterSelect: (file: File) => void;
  onLoadDemoImages: () => void;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  onBeforeSelect,
  onAfterSelect,
  onLoadDemoImages,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const bothLoaded = beforeImage && afterImage;

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updateSlider(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
    };
    const stopDragging = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [isDragging, updateSlider]);

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            Damage Delta Analyzer — Move-In vs. Move-Out
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload both photos then run the AI comparison to identify new tenant-caused damages
          </p>
        </div>
        <button
          onClick={onLoadDemoImages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          ⚡ Load Demo
        </button>
      </div>

      {/* Two-panel upload grid */}
      {!bothLoaded && (
        <div className="grid grid-cols-2 gap-3">
          {/* Before Upload */}
          <div
            onClick={() => beforeInputRef.current?.click()}
            className={cn(
              "relative rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all group aspect-[4/3] flex flex-col items-center justify-center gap-2",
              beforeImage
                ? "border-blue-500/50 bg-slate-900/70"
                : "border-slate-700 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/70"
            )}
          >
            {beforeImage ? (
              <Image src={beforeImage} alt="Move-In" fill className="object-cover" unoptimized />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-blue-400 text-center px-2">Move-In (Before)</p>
                <p className="text-[10px] text-slate-500 text-center px-2">Upload or capture move-in photo</p>
              </>
            )}
            {beforeImage && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-blue-500/80 text-white text-[10px] font-black backdrop-blur-sm">
                BEFORE
              </div>
            )}
          </div>

          {/* After Upload */}
          <div
            onClick={() => afterInputRef.current?.click()}
            className={cn(
              "relative rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all group aspect-[4/3] flex flex-col items-center justify-center gap-2",
              afterImage
                ? "border-red-500/50 bg-slate-900/70"
                : "border-slate-700 hover:border-red-500/50 bg-slate-900/40 hover:bg-slate-900/70"
            )}
          >
            {afterImage ? (
              <Image src={afterImage} alt="Move-Out" fill className="object-cover" unoptimized />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-red-400 text-center px-2">Move-Out (After)</p>
                <p className="text-[10px] text-slate-500 text-center px-2">Upload or capture move-out photo</p>
              </>
            )}
            {afterImage && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-red-500/80 text-white text-[10px] font-black backdrop-blur-sm">
                AFTER
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Split Slider — shown only when both images are loaded */}
      {bothLoaded && (
        <div
          ref={containerRef}
          className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700 shadow-2xl cursor-col-resize select-none bg-slate-950"
          style={{ touchAction: "none" }}
        >
          {/* After (right) image — full width underneath */}
          <div className="absolute inset-0">
            <Image src={afterImage} alt="Move-Out After" fill className="object-cover" unoptimized />
          </div>

          {/* Before (left) image — clipped to slider position */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="absolute inset-0" style={{ width: `${10000 / sliderPosition}%`, minWidth: "100px" }}>
              <Image src={beforeImage} alt="Move-In Before" fill className="object-cover" unoptimized />
            </div>
          </div>

          {/* Corner Labels */}
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-black backdrop-blur-sm shadow-lg border border-blue-400/40">
            ← MOVE-IN (Before)
          </div>
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[11px] font-black backdrop-blur-sm shadow-lg border border-red-400/40">
            MOVE-OUT (After) →
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-30 flex items-center justify-center"
            style={{ left: `calc(${sliderPosition}% - 1px)` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Line */}
            <div className="absolute inset-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />

            {/* Drag Handle */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110">
              <ChevronLeft className="w-3 h-3 text-slate-700 absolute left-1" />
              <ChevronRight className="w-3 h-3 text-slate-700 absolute right-1" />
            </div>
          </div>

          {/* Instruction overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm border border-white/10 whitespace-nowrap pointer-events-none">
            ← Drag to Compare →
          </div>
        </div>
      )}

      {/* Reset / Re-upload buttons when both images loaded */}
      {bothLoaded && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => beforeInputRef.current?.click()}
            className="py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold transition-all"
          >
            Replace Before Photo
          </button>
          <button
            onClick={() => afterInputRef.current?.click()}
            className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold transition-all"
          >
            Replace After Photo
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={beforeInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onBeforeSelect(f);
          if (beforeInputRef.current) beforeInputRef.current.value = "";
        }}
      />
      <input
        ref={afterInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onAfterSelect(f);
          if (afterInputRef.current) afterInputRef.current.value = "";
        }}
      />
    </div>
  );
}
