"use client";

/**
 * InspectionTool — Full self-contained inspection workflow.
 *
 * Handles:
 *  - Mode toggle: Damage Audit (move_out) · Listing Generator (listing) · Delta Compare (delta)
 *  - Single-image: CameraCard → LoadingPulse → OutcomeCard → AuditLog
 *  - Delta: BeforeAfterSlider → LoadingPulse → DeltaOutcomeCard
 */

import { useState, useCallback } from "react";
import { AppMode, MoveOutResult, ListingResult, AuditLogItem, DamageDeltaResult } from "@/types";
import { fileToBase64, fileToDataURL, generateId } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import { CameraCard } from "@/components/CameraCard";
import { LoadingPulse } from "@/components/LoadingPulse";
import { OutcomeCard } from "@/components/OutcomeCard";
import { AuditLog } from "@/components/AuditLog";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { DeltaOutcomeCard } from "@/components/DeltaOutcomeCard";
import { AlertTriangle, ScanLine, ArrowLeftRight } from "lucide-react";

// Demo SVGs injected by the "⚡ Load Demo" button in BeforeAfterSlider
const BEFORE_DEMO_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect width='640' height='420' fill='%230f172a'/><rect x='30' y='30' width='580' height='360' fill='%231e293b' rx='16'/><text x='320' y='290' fill='%2394a3b8' font-size='16' font-weight='bold' text-anchor='middle' font-family='sans-serif'>MOVE-IN: Clean condition. No visible damage.</text></svg>";
const AFTER_DEMO_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect width='640' height='420' fill='%230f172a'/><rect x='30' y='30' width='580' height='360' fill='%231e293b' rx='16'/><circle cx='260' cy='170' r='30' fill='%23ef4444' opacity='0.4'/><text x='320' y='290' fill='%23f87171' font-size='16' font-weight='bold' text-anchor='middle' font-family='sans-serif'>MOVE-OUT: New damage identified.</text></svg>";

type InspectMode = "move_out" | "listing" | "delta";

export default function InspectionTool() {
  // ── Active sub-mode ─────────────────────────────────────
  const [mode, setMode] = useState<InspectMode>("move_out");

  // ── Single-image state ───────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ── Delta state ──────────────────────────────────────────
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [deltaResult, setDeltaResult] = useState<DamageDeltaResult | null>(null);

  // ── Shared UI state ──────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MoveOutResult | ListingResult | null>(null);
  const [resultMode, setResultMode] = useState<"move_out" | "listing">("move_out");
  const [auditLog, setAuditLog] = useState<AuditLogItem[]>([]);

  // ── Mode change resets relevant state ───────────────────
  const handleModeChange = useCallback((newMode: InspectMode) => {
    setMode(newMode);
    setResult(null);
    setDeltaResult(null);
    setError(null);
  }, []);

  // ── Single-image handlers ────────────────────────────────
  const handleImageSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setImagePreview(await fileToDataURL(file));
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !imagePreview || mode === "delta") return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const imageBase64 = await fileToBase64(selectedFile);
      const res = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mode }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? `Server error ${res.status}`);
      setResult(json.data);
      setResultMode(json.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, imagePreview, mode]);

  const handleAddToLog = useCallback(() => {
    if (!result || !imagePreview || resultMode !== "move_out") return;
    setAuditLog((prev) => [
      { id: generateId(), timestamp: new Date().toISOString(), imagePreview, result: result as MoveOutResult },
      ...prev,
    ]);
    handleClear();
  }, [result, imagePreview, resultMode, handleClear]);

  // ── Delta handlers ───────────────────────────────────────
  const handleBeforeSelect = useCallback(async (file: File) => {
    setBeforeFile(file);
    setDeltaResult(null);
    setError(null);
    setBeforePreview(await fileToDataURL(file));
  }, []);

  const handleAfterSelect = useCallback(async (file: File) => {
    setAfterFile(file);
    setDeltaResult(null);
    setError(null);
    setAfterPreview(await fileToDataURL(file));
  }, []);

  const handleLoadDemoImages = useCallback(async () => {
    setDeltaResult(null);
    setError(null);
    const toFile = async (dataUrl: string, name: string) => {
      const blob = await (await fetch(dataUrl)).blob();
      return new File([blob], name, { type: "image/svg+xml" });
    };
    const [bFile, aFile] = await Promise.all([
      toFile(BEFORE_DEMO_SVG, "demo_before.svg"),
      toFile(AFTER_DEMO_SVG, "demo_after.svg"),
    ]);
    setBeforeFile(bFile);
    setAfterFile(aFile);
    setBeforePreview(BEFORE_DEMO_SVG);
    setAfterPreview(AFTER_DEMO_SVG);
  }, []);

  const handleDeltaAnalyze = useCallback(async () => {
    if (!beforeFile || !afterFile) return;
    setIsLoading(true);
    setError(null);
    setDeltaResult(null);
    try {
      const [beforeImageBase64, afterImageBase64] = await Promise.all([
        fileToBase64(beforeFile),
        fileToBase64(afterFile),
      ]);
      const res = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beforeImageBase64, afterImageBase64, mode: "delta" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? `Server error ${res.status}`);
      setDeltaResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }, [beforeFile, afterFile]);

  // ── Sub-mode pill tabs ───────────────────────────────────
  const tabs: { id: InspectMode; label: string }[] = [
    { id: "move_out", label: "Damage Audit" },
    { id: "delta",   label: "Delta Compare" },
    { id: "listing", label: "Listing Gen" },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100">
      {/* Sub-mode tabs */}
      <div className="flex justify-center pt-4 px-4">
        <div className="inline-flex bg-slate-900/80 border border-slate-800 p-1 rounded-xl gap-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleModeChange(id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === id
                  ? id === "delta"
                    ? "bg-purple-600 text-white shadow-md"
                    : id === "listing"
                    ? "bg-emerald-700 text-white shadow-md"
                    : "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {id === "delta" && <ArrowLeftRight className="w-3 h-3 inline mr-1" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Delta Comparison ── */}
      {mode === "delta" && (
        <div className="pt-2">
          <BeforeAfterSlider
            beforeImage={beforePreview}
            afterImage={afterPreview}
            onBeforeSelect={handleBeforeSelect}
            onAfterSelect={handleAfterSelect}
            onLoadDemoImages={handleLoadDemoImages}
          />

          {beforePreview && afterPreview && !isLoading && !deltaResult && (
            <div className="px-4 max-w-2xl mx-auto">
              <button
                onClick={handleDeltaAnalyze}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-all border border-indigo-400/30"
              >
                <ScanLine className="w-5 h-5" />
                Run Damage Delta Analysis (GPT-4o Vision)
              </button>
            </div>
          )}

          {isLoading && <LoadingPulse mode="delta" />}
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
          {deltaResult && !isLoading && <DeltaOutcomeCard result={deltaResult} />}
        </div>
      )}

      {/* ── Single-image modes ── */}
      {(mode === "move_out" || mode === "listing") && (
        <>
          <ModeToggle mode={mode} onChange={(m) => handleModeChange(m as InspectMode)} />
          <CameraCard
            mode={mode}
            imagePreview={imagePreview}
            isLoading={isLoading}
            onImageSelect={handleImageSelect}
            onClear={handleClear}
            onAnalyze={handleAnalyze}
          />
          {isLoading && <LoadingPulse mode={mode} />}
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
          {result && !isLoading && (
            <OutcomeCard
              mode={resultMode}
              result={result}
              imagePreview={imagePreview ?? ""}
              onAddToLog={handleAddToLog}
            />
          )}
          {mode === "move_out" && <AuditLog items={auditLog} onClear={() => setAuditLog([])} />}
        </>
      )}

      <div className="h-10" />
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="px-4 py-2 max-w-2xl mx-auto">
      <div className="flex gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-500/40">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-300">Analysis Failed</p>
          <p className="text-xs text-red-200 mt-0.5">{message}</p>
          <button onClick={onDismiss} className="mt-2 text-xs font-black text-red-400 underline">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
