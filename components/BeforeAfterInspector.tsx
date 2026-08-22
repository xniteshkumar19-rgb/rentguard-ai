'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, FileDown, ScanLine, Upload, X } from 'lucide-react';
import type { DamageDeltaResult } from '@/types';
import { fileToBase64, formatINR } from '@/lib/utils';

const DEFAULT_BEFORE_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop';
const DEFAULT_AFTER_IMG = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop';
type EvidenceSide = 'before' | 'after';

function EvidenceLabel({ side }: { side: EvidenceSide }) {
  const isBefore = side === 'before';
  return <span className={`rg-evidence-label ${isBefore ? 'rg-evidence-label--baseline' : 'rg-evidence-label--exit'}`}>{isBefore ? 'MOVE-IN · BASELINE' : 'MOVE-OUT · EXIT EVIDENCE'}</span>;
}

export function BeforeAfterInspector() {
  const [position, setPosition] = useState(50);
  const [beforeImage, setBeforeImage] = useState(DEFAULT_BEFORE_IMG);
  const [afterImage, setAfterImage] = useState(DEFAULT_AFTER_IMG);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DamageDeltaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const objectUrls = useRef<string[]>([]);
  useEffect(() => () => objectUrls.current.forEach(URL.revokeObjectURL), []);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);
  function onSelect(file: File | undefined, side: EvidenceSide) {
    if (!file) return;
    const url = URL.createObjectURL(file); objectUrls.current.push(url); setResult(null); setError(null);
    if (side === 'before') { setBeforeFile(file); setBeforeImage(url); } else { setAfterFile(file); setAfterImage(url); }
  }
  async function analyze() {
    if (!beforeFile || !afterFile) return;
    setIsLoading(true); setError(null); setResult(null);
    try {
      const [beforeImageBase64, afterImageBase64] = await Promise.all([fileToBase64(beforeFile), fileToBase64(afterFile)]);
      const response = await fetch('/api/inspect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ beforeImageBase64, afterImageBase64, mode: 'delta' }) });
      const payload: { data?: DamageDeltaResult; error?: string } = await response.json();
      if (!response.ok || !payload.data) throw new Error(payload.error ?? 'Analysis could not be completed.');
      setResult(payload.data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Analysis could not be completed.'); } finally { setIsLoading(false); }
  }

  return <section aria-labelledby="comparison-title" className="space-y-5">
    <div className="rg-section-heading"><div><span className="rg-kicker">EXHIBIT A · IMAGE DELTA</span><h2 id="comparison-title" className="rg-display text-3xl sm:text-4xl">Evidence comparison</h2><p className="rg-copy">Align the move-in baseline with exit evidence, then generate a dated, reviewable delta finding.</p></div><div className="rg-readout"><span>REVEAL POSITION</span><strong>{Math.round(position)}%</strong></div></div>
    <div ref={containerRef} className="rg-comparison" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); updateFromClientX(event.clientX); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromClientX(event.clientX); }}>
      <img src={afterImage} alt="Move-out evidence under review" className="rg-comparison-image" draggable={false} /><div className="rg-comparison-before" style={{ width: `${position}%` }}><img src={beforeImage} alt="Move-in baseline evidence" className="rg-comparison-image" draggable={false} /></div><div className="rg-comparison-scrim" /><div className="absolute left-4 top-4"><EvidenceLabel side="before" /></div><div className="absolute right-4 top-4"><EvidenceLabel side="after" /></div><div className="rg-comparison-divider" style={{ left: `${position}%` }} aria-hidden="true"><div className="rg-tape-handle"><ArrowLeftRight size={16} /></div></div><label className="sr-only" htmlFor="evidence-reveal">Compare move-in and move-out evidence</label><input id="evidence-reveal" className="rg-comparison-range" type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} />
    </div>
    <div className="grid gap-3 md:grid-cols-2">{(['before', 'after'] as const).map((side) => { const isBefore = side === 'before'; const file = isBefore ? beforeFile : afterFile; return <label key={side} className={`rg-upload ${isBefore ? 'rg-upload--baseline' : 'rg-upload--exit'}`}><Upload size={16} aria-hidden="true" /><span><strong>{file ? file.name : `Attach ${isBefore ? 'move-in' : 'move-out'} photo`}</strong><small>{file ? 'Evidence attached · replace if needed' : isBefore ? 'Baseline condition record' : 'Exit condition record'}</small></span><input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => onSelect(event.target.files?.[0], side)} />{file && <X size={15} aria-hidden="true" />}</label>; })}</div>
    <div className="rg-analysis-bar"><div><span className="rg-kicker">ANALYSIS STATUS</span><p>{beforeFile && afterFile ? 'Paired evidence ready for review.' : 'Attach both records to begin a defensible comparison.'}</p></div><button type="button" onClick={analyze} disabled={!beforeFile || !afterFile || isLoading} className="rg-button rg-button--primary"><ScanLine size={16} />{isLoading ? 'ANALYSING EVIDENCE…' : 'RUN DELTA ANALYSIS'}</button></div>
    {error && <p role="alert" className="rg-alert">{error}</p>}{result && <DeltaFinding result={result} />}
  </section>;
}

function DeltaFinding({ result }: { result: DamageDeltaResult }) {
  const hasLiability = result.total_new_deductible_high > 0;
  return <article className="rg-finding" aria-live="polite"><div className="rg-finding-head"><div><span className="rg-kicker">AI FINDING · {result.confidence}% EVIDENCE CONFIDENCE</span><h3 className="rg-display text-2xl">{result.overall_condition_change} condition record</h3></div><span className={hasLiability ? 'rg-stamp-rust' : 'rg-stamp-stable'}>{result.tenant_liability} LIABILITY</span></div><p className="rg-copy">{result.summary}</p><div className="grid gap-px sm:grid-cols-3 bg-[var(--rg-line-strong)] border border-[var(--rg-line-strong)]"><div className="rg-finding-metric"><span>NEW FINDINGS</span><strong>{result.new_damages.length}</strong></div><div className="rg-finding-metric"><span>VALUATION RANGE</span><strong>{formatINR(result.total_new_deductible_low)}–{formatINR(result.total_new_deductible_high)}</strong></div><div className="rg-finding-metric"><span>REVIEW CERTAINTY</span><strong>{result.confidence}%</strong></div></div><div className="rg-reasoning"><strong>Reasoning note</strong><p>{result.legal_reasoning}</p></div><button type="button" className="rg-button rg-button--secondary" onClick={() => window.print()}><FileDown size={15} />PRINT CASE FINDING</button></article>;
}
export default BeforeAfterInspector;
