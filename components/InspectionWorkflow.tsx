'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Coins,
  RefreshCw,
  Image as ImageIcon,
  Plus,
  Trash2,
  Scale,
  Clock,
  ArrowLeftRight,
  Sliders,
  Check,
  FileCheck2,
  Eye,
  Info,
} from 'lucide-react';
import { cn, formatINR, fileToBase64, fileToDataURL, tagId } from '@/lib/utils';
import { MoveOutResult, DamageDeltaResult } from '@/types';
import { MOCK_MOVE_OUT_RESULTS, MOCK_DELTA_RESULTS } from '@/lib/mockData';

interface RoomEvidence {
  id: string;
  name: string;
  moveInImage: string;
  moveInDate: string;
  notes: string;
  moveOutImage?: string;
  moveOutDate?: string;
  status: 'baseline_only' | 'ready_for_ai' | 'audited';
  aiFinding?: {
    defect_type: string;
    classification: 'Normal Wear & Tear' | 'Minor Damage' | 'Moderate Damage' | 'Significant Damage';
    confidence: number;
    estimatedCost: string;
    depositImpact: number;
    reasoning: string;
    legalClause: string;
  };
}

const DEFAULT_ROOMS: RoomEvidence[] = [
  {
    id: 'RM-7F2A1',
    name: 'Living Room',
    moveInImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    moveInDate: '2025-08-15',
    notes: 'Freshly painted off-white walls, hardwood floors in immaculate shape.',
    moveOutImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
    moveOutDate: '2026-08-20',
    status: 'audited',
    aiFinding: {
      defect_type: 'Wall Scuff Mark (East Wall)',
      classification: 'Normal Wear & Tear',
      confidence: 94,
      estimatedCost: '₹0 – ₹500',
      depositImpact: 0,
      reasoning: 'Minor surface-level marking at shoulder height consistent with ordinary residential occupancy. Surface rubbing did not penetrate the drywall core.',
      legalClause: 'Section 15(2) of Model Tenancy Act — Landlord is responsible for gradual aging; zero tenant liability.',
    },
  },
  {
    id: 'RM-4C89D',
    name: 'Modular Kitchen',
    moveInImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop',
    moveInDate: '2025-08-15',
    notes: 'Black granite countertop, soft-close cabinets, clean exhaust hood.',
    moveOutImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop',
    moveOutDate: '2026-08-20',
    status: 'audited',
    aiFinding: {
      defect_type: 'Chipped Granite Countertop',
      classification: 'Moderate Damage',
      confidence: 88,
      estimatedCost: '₹4,500',
      depositImpact: 4500,
      reasoning: 'Sharp impact fracture (3.2cm) near sink basin exceeds standard wear & tear threshold. Requires localized resin filling and diamond pad polishing.',
      legalClause: 'Clause 8(B) Standard Lease — Accidental impact damage deductible from security deposit at certified vendor rate.',
    },
  },
  {
    id: 'RM-9E110',
    name: 'Master Bedroom',
    moveInImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop',
    moveInDate: '2025-08-15',
    notes: 'Laminate flooring, large wardrobe, north-facing window.',
    moveOutImage: 'https://images.unsplash.com/photo-1616594039750-ae9021a400a0?q=80&w=1200&auto=format&fit=crop',
    moveOutDate: '2026-08-20',
    status: 'audited',
    aiFinding: {
      defect_type: 'Faded Paint & Window Sunlight Aging',
      classification: 'Normal Wear & Tear',
      confidence: 97,
      estimatedCost: '₹0',
      depositImpact: 0,
      reasoning: 'Even UV discoloration adjacent to window aperture. Completely consistent with 12 months of sunlight exposure.',
      legalClause: 'Habitability & Maintenance Code — Landlord routine turnover repainting.',
    },
  },
];

const ROOM_PRESETS = ['Living Room', 'Modular Kitchen', 'Master Bedroom', 'Bathroom', 'Balcony', 'Study / Office'];

export function InspectionWorkflow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rooms, setRooms] = useState<RoomEvidence[]>(DEFAULT_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(DEFAULT_ROOMS[0].id);

  // New room draft form state
  const [newRoomName, setNewRoomName] = useState('Bathroom');
  const [newRoomNotes, setNewRoomNotes] = useState('');
  const [uploadedMoveInImg, setUploadedMoveInImg] = useState<string | null>(null);

  // Scrubber comparison position (0 - 100%)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Step 3 AI Analyzing state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Drag listeners for the tape-measure split slider
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleSliderMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const handleStopDrag = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleStopDrag);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleStopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStopDrag);
    };
  }, [isDragging, handleSliderMove]);

  // Upload handlers
  const handleMoveInUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedMoveInImg(url);
    }
  };

  const handleMoveOutUploadForCurrentRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoomId
            ? { ...r, moveOutImage: url, moveOutDate: '2026-08-22', status: 'ready_for_ai' }
            : r
        )
      );
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedMoveInImg) {
      alert('Please upload or select a baseline photo for the room.');
      return;
    }
    const newRoom: RoomEvidence = {
      id: tagId('RM'),
      name: newRoomName,
      moveInImage: uploadedMoveInImg,
      moveInDate: new Date().toISOString().split('T')[0],
      notes: newRoomNotes || 'Initial move-in inspection baseline captured.',
      status: 'baseline_only',
    };
    setRooms((prev) => [...prev, newRoom]);
    setSelectedRoomId(newRoom.id);
    setUploadedMoveInImg(null);
    setNewRoomNotes('');
  };

  const handleTriggerAI = async () => {
    setIsAnalyzing(true);
    setStep(3);

    // Staged realistic analysis animation
    setAnalysisStage('1/3: Aligning move-in baseline against move-out camera angles…');
    await new Promise((r) => setTimeout(r, 600));
    setAnalysisStage('2/3: Computer vision detecting surface fractures & color delta…');
    await new Promise((r) => setTimeout(r, 700));
    setAnalysisStage('3/3: Cross-referencing Model Tenancy Act wear & tear statutes…');
    await new Promise((r) => setTimeout(r, 600));

    // Update room with AI finding
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoomId
          ? {
              ...r,
              status: 'audited',
              aiFinding: r.aiFinding || {
                defect_type: 'Minor Baseboard Abrasion',
                classification: 'Normal Wear & Tear',
                confidence: 92,
                estimatedCost: '₹0',
                depositImpact: 0,
                reasoning: 'Surface micro-scratches on timber skirting board are consistent with standard vacuum cleaner and furniture usage.',
                legalClause: 'Statutory Exclusion — Non-structural superficial friction.',
              },
            }
          : r
      )
    );
    setIsAnalyzing(false);
  };

  const getBadgeStyle = (classification?: string) => {
    switch (classification) {
      case 'Normal Wear & Tear':
        return 'bg-[rgba(75,156,147,0.15)] text-[var(--rg-teal)] border-[var(--rg-teal-dim)]';
      case 'Minor Damage':
        return 'bg-[rgba(201,154,75,0.15)] text-[var(--rg-brass)] border-[var(--rg-brass-dim)]';
      case 'Moderate Damage':
        return 'bg-[rgba(234,138,56,0.15)] text-[#ea8a38] border-[#8a4e1a]';
      case 'Significant Damage':
      default:
        return 'bg-[rgba(193,85,61,0.15)] text-[var(--rg-rust)] border-[var(--rg-rust-dim)]';
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Inspection Header & Progress Stepper ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--rg-line)] pb-5">
        <div>
          <span className="rg-mono text-[11px] px-2.5 py-1 border border-[var(--rg-brass-dim)] text-[var(--rg-brass)] bg-[var(--rg-brass-dim)]/20 rounded-sm">
            INSPECTION ENGINE · CASE #2026-0417
          </span>
          <h2 className="rg-display text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] mt-2">
            Move-In &amp; Move-Out Forensic Auditor
          </h2>
        </div>

        {/* Numbered Stepper Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--rg-surface)] border border-[var(--rg-line-strong)]">
          <button
            onClick={() => setStep(1)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-xs rg-mono font-bold rounded-lg transition-all cursor-pointer',
              step === 1
                ? 'bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] shadow-[0_0_10px_rgba(201,154,75,0.2)]'
                : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
            )}
          >
            <span className="w-5 h-5 rounded-full bg-[var(--rg-surface)] border border-current flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Move-In</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-xs rg-mono font-bold rounded-lg transition-all cursor-pointer',
              step === 2
                ? 'bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] shadow-[0_0_10px_rgba(201,154,75,0.2)]'
                : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
            )}
          >
            <span className="w-5 h-5 rounded-full bg-[var(--rg-surface)] border border-current flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Move-Out Scrubber</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-xs rg-mono font-bold rounded-lg transition-all cursor-pointer',
              step === 3
                ? 'bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] shadow-[0_0_10px_rgba(201,154,75,0.2)]'
                : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
            )}
          >
            <span className="w-5 h-5 rounded-full bg-[var(--rg-surface)] border border-current flex items-center justify-center text-[10px]">
              3
            </span>
            <span>AI Findings</span>
          </button>
        </div>
      </div>

      {/* ── Room Selector Strip ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs rg-mono text-[var(--rg-ink-faint)] uppercase font-bold shrink-0">
          SELECT ROOM:
        </span>
        {rooms.map((r) => {
          const isSelected = r.id === selectedRoomId;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRoomId(r.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rg-mono rounded-lg border transition-all shrink-0 cursor-pointer',
                isSelected
                  ? 'bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border-[var(--rg-brass)] shadow-[0_0_12px_rgba(201,154,75,0.2)]'
                  : 'bg-[var(--rg-surface)] text-[var(--rg-ink-dim)] border-[var(--rg-line-strong)] hover:border-[var(--rg-brass-dim)] hover:text-[var(--rg-ink)]'
              )}
            >
              <span>{r.name}</span>
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  r.status === 'audited'
                    ? r.aiFinding?.classification === 'Normal Wear & Tear'
                      ? 'bg-[var(--rg-teal)] shadow-[0_0_6px_var(--rg-teal)]'
                      : 'bg-[var(--rg-rust)] shadow-[0_0_6px_var(--rg-rust)]'
                    : 'bg-amber-400'
                )}
              />
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* STEP 1: MOVE-IN EVIDENCE                                  */}
      {/* ───────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Upload / Capture New Baseline Card */}
            <form onSubmit={handleAddRoom} className="p-6 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-4 rg-glass-2">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--rg-line)]">
                <h3 className="text-base font-bold text-[var(--rg-ink)] rg-display">
                  + Add Room Baseline
                </h3>
                <span className="text-[10px] rg-mono text-[var(--rg-teal)] bg-[rgba(75,156,147,0.12)] px-2 py-0.5 rounded border border-[var(--rg-teal-dim)]">
                  STEP 1 EVIDENCE
                </span>
              </div>

              {/* Room Name Presets */}
              <div className="space-y-1.5">
                <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium">Room Name:</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ROOM_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewRoomName(p)}
                      className={cn(
                        'px-2 py-1 text-[10px] rg-mono rounded border transition-all cursor-pointer',
                        newRoomName === p
                          ? 'border-[var(--rg-brass)] text-[var(--rg-brass)] bg-[rgba(201,154,75,0.1)]'
                          : 'border-[var(--rg-line)] text-[var(--rg-ink-faint)] hover:text-[var(--rg-ink)]'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Master Bedroom"
                  className="w-full bg-[var(--rg-bg)] border border-[var(--rg-line-strong)] px-3 py-2 text-xs rg-mono text-[var(--rg-ink)] rounded-lg outline-none focus:border-[var(--rg-brass)]"
                />
              </div>

              {/* Upload or Webcam zone */}
              <div className="space-y-1.5">
                <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium">Move-In Photography:</label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--rg-line-strong)] hover:border-[var(--rg-teal)] bg-[var(--rg-surface-raised)] rounded-xl cursor-pointer transition-all group">
                  {uploadedMoveInImg ? (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[var(--rg-teal)]">
                      <img src={uploadedMoveInImg} alt="Uploaded baseline" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold rg-mono text-white">
                        Click to replace photo
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[rgba(75,156,147,0.15)] text-[var(--rg-teal)] flex items-center justify-center border border-[var(--rg-teal-dim)]">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--rg-ink)] rg-mono">Upload or Capture Baseline</p>
                        <p className="text-[11px] text-[var(--rg-ink-faint)]">JPEG, PNG or Camera stream</p>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleMoveInUpload} className="hidden" />
                </label>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="text-xs rg-mono text-[var(--rg-ink-dim)] font-medium">Move-in Condition Notes (Optional):</label>
                <textarea
                  value={newRoomNotes}
                  onChange={(e) => setNewRoomNotes(e.target.value)}
                  placeholder="e.g. Minor paint bubble near ceiling corner, floor free of marks."
                  rows={2}
                  className="w-full bg-[var(--rg-bg)] border border-[var(--rg-line-strong)] px-3 py-2 text-xs rg-mono text-[var(--rg-ink)] rounded-lg outline-none focus:border-[var(--rg-brass)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--rg-teal)] hover:bg-[#5db4aa] text-[#0b0d0c] font-bold rg-mono text-xs rounded-lg shadow-[0_0_15px_rgba(75,156,147,0.3)] transition-all cursor-pointer"
              >
                + Attach Baseline to Case File
              </button>
            </form>

            {/* Right 2-Cols: Gallery of Recorded Move-In Evidence */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--rg-ink)] rg-display">
                  Recorded Baseline Vault ({rooms.length} Spaces)
                </h3>
                <span className="text-xs rg-mono text-[var(--rg-ink-dim)]">
                  Move-In Date: <strong className="text-[var(--rg-teal)]">Aug 15, 2025</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={cn(
                      'rg-tag rg-lift p-4 rounded-xl border bg-[var(--rg-surface)] space-y-3 cursor-pointer transition-all rg-glass-2 rg-glass-hover',
                      room.id === selectedRoomId
                        ? 'border-[var(--rg-brass)] shadow-[0_0_15px_rgba(201,154,75,0.15)]'
                        : 'border-[var(--rg-line-strong)] hover:border-[var(--rg-brass-dim)]'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] font-bold">{room.id}</span>
                        <h4 className="text-sm font-bold text-[var(--rg-ink)]">{room.name}</h4>
                      </div>
                      <span className="text-[10px] rg-mono px-2 py-0.5 bg-[rgba(75,156,147,0.1)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] rounded-sm">
                        BASELINE LOCKED
                      </span>
                    </div>

                    <div className="relative h-36 rounded-lg overflow-hidden border border-[var(--rg-line)]">
                      <img src={room.moveInImage} alt={room.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[9px] rg-mono text-[var(--rg-teal)] border border-[var(--rg-teal-dim)]">
                        MOVE-IN: {room.moveInDate}
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--rg-ink-dim)] line-clamp-2 italic">
                      "{room.notes}"
                    </p>

                    <div className="pt-2 border-t border-[var(--rg-line)] flex items-center justify-between text-xs rg-mono">
                      <span className="text-[var(--rg-ink-faint)]">Status:</span>
                      <span className="text-[var(--rg-brass)] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Baseline Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-[var(--rg-brass-dim)] bg-[rgba(201,154,75,0.06)] flex items-center justify-between rg-glass-3">
                <div>
                  <div className="text-xs font-bold text-[var(--rg-ink)] uppercase rg-mono">Ready for move-out comparison?</div>
                  <div className="text-[11px] text-[var(--rg-ink-dim)]">Upload move-out photos to reveal baseline delta.</div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold text-xs rg-mono rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Proceed to Step 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* STEP 2: MOVE-OUT EVIDENCE & COMPARISON SLIDER             */}
      {/* ───────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Active room comparison banner */}
          <div className="p-4 rounded-xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 rg-glass-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgba(201,154,75,0.15)] border border-[var(--rg-brass-dim)] flex items-center justify-center text-[var(--rg-brass)] font-bold text-sm rg-mono">
                {currentRoom.id.slice(-3)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--rg-ink)]">{currentRoom.name} — Scrubber Comparison</h3>
                <p className="text-xs rg-mono text-[var(--rg-ink-dim)]">
                  Move-In: <span className="text-[var(--rg-teal)]">{currentRoom.moveInDate}</span> vs. Move-Out: <span className="text-[var(--rg-rust)]">{currentRoom.moveOutDate || 'Current'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] text-[var(--rg-rust)] border border-[var(--rg-rust-dim)] rounded-lg text-xs font-bold rg-mono cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Move-Out Photo</span>
                <input type="file" accept="image/*" onChange={handleMoveOutUploadForCurrentRoom} className="hidden" />
              </label>

              <button
                onClick={handleTriggerAI}
                className="px-5 py-2 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold text-xs rg-mono rounded-lg shadow-[0_0_15px_rgba(201,154,75,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Audit</span>
              </button>
            </div>
          </div>

          {/* Interactive Split-Screen Scrubber Viewport */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs rg-mono">
              <span className="text-[var(--rg-teal)] font-bold flex items-center gap-1">
                ◀ MOVE-IN BASELINE ({100 - Math.round(sliderPosition)}% Hidden)
              </span>
              <span className="text-[var(--rg-ink-faint)] font-bold">DRAG SLIDER TO REVEAL DELTA</span>
              <span className="text-[var(--rg-rust)] font-bold flex items-center gap-1">
                MOVE-OUT INSPECTION ({Math.round(sliderPosition)}% Revealed) ▶
              </span>
            </div>

            <div
              ref={sliderContainerRef}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleSliderMove(e.clientX);
              }}
              onTouchStart={(e) => {
                if (e.touches.length > 0) {
                  setIsDragging(true);
                  handleSliderMove(e.touches[0].clientX);
                }
              }}
              className="relative h-[380px] sm:h-[480px] w-full rounded-2xl border border-[var(--rg-line-strong)] select-none overflow-hidden cursor-ew-resize bg-[var(--rg-surface)] shadow-2xl"
            >
              {/* Background: Move-Out Photo */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={currentRoom.moveOutImage || currentRoom.moveInImage}
                  alt="Move-out inspection state"
                  className="w-full h-full object-cover filter brightness-95"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Move-Out Evidence Tag */}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rg-mono bg-black/80 text-[var(--rg-rust)] border border-[var(--rg-rust)] rounded backdrop-blur-md">
                    MOVE-OUT STATE
                  </span>
                </div>
              </div>

              {/* Foreground: Move-In Baseline Photo (Clipped) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={currentRoom.moveInImage}
                  alt="Move-in baseline state"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Move-In Evidence Tag */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rg-mono bg-black/80 text-[var(--rg-teal)] border border-[var(--rg-teal)] rounded backdrop-blur-md">
                    MOVE-IN BASELINE
                  </span>
                </div>
              </div>

              {/* Tape Measure Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Vertical Ruler Line with tick marks */}
                <div className="rg-tape-ticks -translate-x-1/2 flex flex-col justify-between py-2">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-[1.5px] -translate-x-1/2"
                      style={{ backgroundColor: 'var(--rg-brass)' }}
                    />
                  ))}
                </div>

                {/* Brass Circular Grip */}
                <div className="rg-tape-handle">
                  <ArrowLeftRight className="w-4 h-4 text-[#2a1e08]" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* STEP 3: AI INSPECTION & RESULT CARDS                      */}
      {/* ───────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {isAnalyzing ? (
            /* Analyzing Loading State */
            <div className="py-16 px-6 text-center space-y-6 rounded-2xl border border-[var(--rg-brass-dim)] bg-[var(--rg-surface)] shadow-2xl rg-glass-1">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--rg-brass)] border-t-transparent animate-spin" />
                <Sparkles className="w-6 h-6 text-[var(--rg-brass)] animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[var(--rg-ink)] rg-display">
                  Analyzing Room Condition &amp; Wear Statutes…
                </h3>
                <p className="text-xs rg-mono text-[var(--rg-brass)] font-semibold max-w-md mx-auto">
                  {analysisStage}
                </p>
              </div>
            </div>
          ) : (
            /* AI Results View */
            <div className="space-y-8">
              {/* Summary Banner */}
              <div className="p-5 rounded-2xl border border-[var(--rg-line-strong)] bg-gradient-to-r from-[var(--rg-surface-raised)] to-[var(--rg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 rg-glass-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rg-mono font-bold uppercase text-[var(--rg-teal)] bg-[rgba(75,156,147,0.12)] px-2 py-0.5 rounded border border-[var(--rg-teal-dim)]">
                      AI AUDIT COMPLETE
                    </span>
                    <span className="text-xs rg-mono text-[var(--rg-ink-faint)]">Target: {currentRoom.name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--rg-ink)] mt-1">
                    Findings for {currentRoom.name} ({currentRoom.id})
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTriggerAI}
                    className="px-3.5 py-2 text-xs rg-mono text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] border border-[var(--rg-line-strong)] rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-scan
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="px-3.5 py-2 text-xs rg-mono text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" /> View Scrubber
                  </button>
                </div>
              </div>

              {/* Main AI Result Card */}
              {currentRoom.aiFinding ? (
                <div className="rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] overflow-hidden shadow-2xl rg-glass-1">
                  {/* Card Header with Classification */}
                  <div className="p-6 border-b border-[var(--rg-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--rg-surface-raised)]">
                    <div>
                      <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] font-bold">PRIMARY FINDING</span>
                      <h4 className="text-xl font-bold text-[var(--rg-ink)] mt-0.5">
                        {currentRoom.aiFinding.defect_type}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'px-3.5 py-1 text-xs font-bold uppercase tracking-wider rg-mono rounded border',
                          getBadgeStyle(currentRoom.aiFinding.classification)
                        )}
                      >
                        {currentRoom.aiFinding.classification}
                      </span>
                    </div>
                  </div>

                  {/* Financial & Valuation Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--rg-line)] border-b border-[var(--rg-line)]">
                    <div className="p-5">
                      <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] font-bold uppercase">
                        AI CONFIDENCE
                      </span>
                      <div className="text-2xl font-bold text-[var(--rg-teal)] rg-mono mt-1">
                        {currentRoom.aiFinding.confidence}%
                      </div>
                      <p className="text-[11px] text-[var(--rg-ink-dim)] mt-0.5">High certainty computer vision score</p>
                    </div>

                    <div className="p-5">
                      <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] font-bold uppercase">
                        ESTIMATED REPAIR
                      </span>
                      <div className="text-2xl font-bold text-[var(--rg-brass)] rg-mono mt-1">
                        {currentRoom.aiFinding.estimatedCost}
                      </div>
                      <p className="text-[11px] text-[var(--rg-ink-dim)] mt-0.5">Certified contractor benchmark</p>
                    </div>

                    <div className="p-5">
                      <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] font-bold uppercase">
                        DEPOSIT DEDUCTION IMPACT
                      </span>
                      <div className="text-2xl font-bold text-[var(--rg-rust)] rg-mono mt-1">
                        {formatINR(currentRoom.aiFinding.depositImpact)}
                      </div>
                      <p className="text-[11px] text-[var(--rg-ink-dim)] mt-0.5">Allowable under lease terms</p>
                    </div>
                  </div>

                  {/* Reasoning & Evidence Details */}
                  <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase rg-mono text-[var(--rg-brass)]">
                        <Scale className="w-4 h-4" />
                        <span>Forensic AI Reasoning:</span>
                      </div>
                      <p className="text-sm text-[var(--rg-ink)] leading-relaxed bg-[var(--rg-surface-raised)] p-4 rounded-xl border border-[var(--rg-line)]">
                        {currentRoom.aiFinding.reasoning}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase rg-mono text-[var(--rg-teal)]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Statutory Tenancy Framework:</span>
                      </div>
                      <p className="text-xs text-[var(--rg-ink-dim)] bg-[rgba(75,156,147,0.06)] p-3 rounded-xl border border-[var(--rg-teal-dim)] rg-mono">
                        {currentRoom.aiFinding.legalClause}
                      </p>
                    </div>

                    {/* Dual Thumbnail Comparison Preview */}
                    <div className="pt-2">
                      <span className="text-xs font-bold uppercase rg-mono text-[var(--rg-ink-faint)] mb-2 block">
                        Cross-Referenced Evidence Assets:
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative rounded-lg overflow-hidden border border-[var(--rg-teal-dim)]">
                          <img src={currentRoom.moveInImage} alt="Baseline" className="w-full h-28 object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/80 rounded text-[9px] rg-mono text-[var(--rg-teal)]">
                            MOVE-IN (NO DAMAGE)
                          </span>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border border-[var(--rg-rust-dim)]">
                          <img src={currentRoom.moveOutImage || currentRoom.moveInImage} alt="Move-out" className="w-full h-28 object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/80 rounded text-[9px] rg-mono text-[var(--rg-rust)]">
                            MOVE-OUT AUDIT
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InspectionWorkflow;
