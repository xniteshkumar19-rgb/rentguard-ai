'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Camera,
  GitCompare,
  CheckCircle2,
  Coins,
  ArrowRight,
  Sparkles,
  Scale,
  Clock,
  Building,
  FileText,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavTab } from './Navigation';

interface LandingHeroProps {
  onNavigate: (tab: NavTab) => void;
}

function CountUp({ to, prefix = '', suffix = '', duration = 1400 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [to, duration]);

  return (
    <span>
      {prefix}
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export function LandingHero({ onNavigate }: LandingHeroProps) {
  return (
    <div className="space-y-12 py-6">
      {/* ── Top Hero Section ── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--rg-line-strong)] bg-gradient-to-b from-[var(--rg-surface-raised)]/90 via-[var(--rg-surface)]/80 to-[var(--rg-bg)] p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(201,154,75,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(75,156,147,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs rg-mono font-bold uppercase tracking-wider rounded-full border border-[var(--rg-brass-dim)] bg-[rgba(201,154,75,0.1)] text-[var(--rg-brass)] shadow-[0_0_12px_rgba(201,154,75,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--rg-brass)] animate-pulse" />
            AI-POWERED ROOM HANDOVER &amp; SECURITY DEPOSIT PROTECTION
          </div>

          {/* Main Headline & Rubber Stamp */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="rg-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--rg-ink)] leading-[1.02]">
                Protect your deposit<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--rg-brass)] via-[#e6b866] to-[var(--rg-teal)]">
                  with visual proof.
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[var(--rg-ink-dim)] max-w-2xl leading-relaxed">
                Photograph your room when you move in. Photograph it again when you move out.
                RentGuard AI proves what changed, classifies normal wear &amp; tear, and calculates a fair, legally defensible deposit refund.
              </p>
            </div>

            {/* Signature Forensic Verified Stamp */}
            <div className="hidden lg:flex rg-stamp shrink-0 flex-col items-center justify-center w-28 h-28 rounded-full border-[3px] border-[var(--rg-rust)] text-[var(--rg-rust)] rg-mono text-[11px] font-bold tracking-widest text-center leading-tight -rotate-[8deg] bg-[rgba(193,85,61,0.08)] shadow-[0_0_20px_rgba(193,85,61,0.2)] select-none">
              <span>CASE VERIFIED</span>
              <span className="text-[9px] font-normal tracking-normal text-[var(--rg-ink-faint)] mt-0.5">MODEL ACT</span>
              <span className="text-[10px] text-[var(--rg-rust)] font-black mt-0.5">₹ 0 DISPUTE</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('new_inspection')}
              className="rg-pulse flex items-center gap-2.5 px-6 py-3.5 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold rg-mono text-sm rounded-lg shadow-[0_0_25px_rgba(201,154,75,0.35)] transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" />
              <span>Start New Inspection</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('deposit_report')}
              className="flex items-center gap-2 px-5 py-3.5 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] text-[var(--rg-ink)] border border-[var(--rg-line-strong)] hover:border-[var(--rg-teal-dim)] font-semibold rg-mono text-sm rounded-lg transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[var(--rg-teal)]" />
              <span>View Deposit Report</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="flex items-center gap-1.5 px-4 py-3.5 text-xs rg-mono text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] transition-colors cursor-pointer"
            >
              <span>View Inspection History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── 10-Second Visual Story Flow ── */}
        <div className="mt-10 pt-8 border-t border-[var(--rg-line)]">
          <p className="text-[11px] rg-mono font-bold uppercase tracking-widest text-[var(--rg-ink-faint)] mb-4">
            HOW RENTGUARD WORKS IN 4 STEPS:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--rg-surface)]/80 border border-[var(--rg-line-strong)]">
              <div className="w-9 h-9 rounded-lg bg-[rgba(75,156,147,0.15)] border border-[var(--rg-teal-dim)] flex items-center justify-center text-[var(--rg-teal)] shrink-0 font-bold rg-mono text-sm">
                1
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--rg-ink)] uppercase tracking-wide">Move-In Capture</div>
                <div className="text-[11px] text-[var(--rg-ink-dim)] truncate">Photo baseline recorded</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--rg-surface)]/80 border border-[var(--rg-line-strong)]">
              <div className="w-9 h-9 rounded-lg bg-[rgba(201,154,75,0.15)] border border-[var(--rg-brass-dim)] flex items-center justify-center text-[var(--rg-brass)] shrink-0 font-bold rg-mono text-sm">
                2
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--rg-ink)] uppercase tracking-wide">Move-Out Capture</div>
                <div className="text-[11px] text-[var(--rg-ink-dim)] truncate">End-of-lease photography</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--rg-surface)]/80 border border-[var(--rg-line-strong)]">
              <div className="w-9 h-9 rounded-lg bg-[rgba(193,85,61,0.15)] border border-[var(--rg-rust-dim)] flex items-center justify-center text-[var(--rg-rust)] shrink-0 font-bold rg-mono text-sm">
                3
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--rg-ink)] uppercase tracking-wide">AI Delta Engine</div>
                <div className="text-[11px] text-[var(--rg-ink-dim)] truncate">Filters wear vs damage</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--rg-surface)]/80 border border-[var(--rg-teal-dim)] bg-[rgba(75,156,147,0.06)]">
              <div className="w-9 h-9 rounded-lg bg-[var(--rg-teal)] text-[#0b0d0c] flex items-center justify-center shrink-0 font-bold rg-mono text-sm shadow-[0_0_10px_rgba(75,156,147,0.4)]">
                4
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--rg-teal)] uppercase tracking-wide">Fair Deposit</div>
                <div className="text-[11px] text-[var(--rg-ink-dim)] truncate">Legally defensible payout</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Benefit Cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Benefit 1 */}
        <div className="rg-lift p-6 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(75,156,147,0.15)] border border-[var(--rg-teal-dim)] flex items-center justify-center text-[var(--rg-teal)]">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[var(--rg-ink)] rg-display tracking-wide">
            1. Visual Evidence Vault
          </h2>
          <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed">
            Tamper-proof digital photographic log with split-screen comparison slider. Proves baseline conditions existed before keys were handed over.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] rg-mono text-[var(--rg-teal)]">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-precision image scrubber
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="rg-lift p-6 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(201,154,75,0.15)] border border-[var(--rg-brass-dim)] flex items-center justify-center text-[var(--rg-brass)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[var(--rg-ink)] rg-display tracking-wide">
            2. AI Damage Detection
          </h2>
          <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed">
            Computer vision cross-references tenancy statutes to distinguish between unavoidable aging (faded paint) and deductible tenant negligence (counter chips).
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] rg-mono text-[var(--rg-brass)]">
            <Scale className="w-3.5 h-3.5" /> 94% Model classification accuracy
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="rg-lift p-6 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(193,85,61,0.15)] border border-[var(--rg-rust-dim)] flex items-center justify-center text-[var(--rg-rust)]">
            <Coins className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[var(--rg-ink)] rg-display tracking-wide">
            3. Fair Deposit Settlement
          </h2>
          <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed">
            Automated rupee repair valuation protects against inflated landlord deductions. Exports an itemized audit ledger ready for mediation or arbitration.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] rg-mono text-[var(--rg-rust)]">
            <Coins className="w-3.5 h-3.5" /> Real-time INR liability sum
          </div>
        </div>
      </section>

      {/* ── Live Performance Metrics & Case Dossier Summary ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Counter Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--rg-line)]">
              <div>
                <span className="rg-mono text-[10px] text-[var(--rg-ink-faint)] tracking-wider">PAN-INDIA LEDGER METRICS</span>
                <h3 className="rg-display text-xl text-[var(--rg-ink)] mt-0.5">Platform Dispute Resolution</h3>
              </div>
              <span className="px-2.5 py-1 text-[10px] rg-mono font-bold uppercase rounded bg-[rgba(75,156,147,0.12)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)]">
                LIVE AUDIT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div>
                <div className="rg-mono text-3xl font-black text-[var(--rg-brass)]">
                  <CountUp to={2417000} prefix="₹" />
                </div>
                <p className="rg-mono text-[11px] text-[var(--rg-ink-dim)] mt-1">DISPUTES RESOLVED TO DATE</p>
              </div>

              <div>
                <div className="rg-mono text-3xl font-black text-[var(--rg-teal)]">
                  <CountUp to={1204} />
                </div>
                <p className="rg-mono text-[11px] text-[var(--rg-ink-dim)] mt-1">ROOM INSPECTIONS LOGGED</p>
              </div>

              <div>
                <div className="rg-mono text-3xl font-black text-[var(--rg-ink)]">
                  <CountUp to={94} suffix="%" />
                </div>
                <p className="rg-mono text-[11px] text-[var(--rg-ink-dim)] mt-1">AI VALUATION ACCURACY</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--rg-line)] flex items-center justify-between text-xs text-[var(--rg-ink-dim)]">
            <span className="rg-mono text-[11px]">Governed by the Indian Model Tenancy Act &amp; RERA Standards</span>
            <button
              onClick={() => onNavigate('new_inspection')}
              className="text-[var(--rg-brass)] hover:underline font-bold rg-mono flex items-center gap-1 cursor-pointer"
            >
              Start Inspection <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Active Case File Summary */}
        <div className="p-6 rounded-2xl border border-[var(--rg-brass-dim)] bg-gradient-to-b from-[rgba(201,154,75,0.08)] to-[var(--rg-surface)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] rg-mono font-bold uppercase tracking-wider bg-[var(--rg-brass)] text-[#120d06] rounded-sm">
                ACTIVE CASE FILE
              </span>
              <span className="rg-mono text-[10px] text-[var(--rg-ink-faint)]">#2026-0417</span>
            </div>

            <div>
              <h4 className="text-base font-bold text-[var(--rg-ink)]">Tower 4 · Flat 1204</h4>
              <p className="text-xs text-[var(--rg-ink-dim)] rg-mono">DLF CyberCity, Sector 24, Gurugram</p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--rg-surface-raised)] border border-[var(--rg-line)] space-y-2 text-xs rg-mono">
              <div className="flex justify-between">
                <span className="text-[var(--rg-ink-faint)]">Security Deposit:</span>
                <span className="font-bold text-[var(--rg-ink)]">₹50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--rg-ink-faint)]">Assessed Deductions:</span>
                <span className="font-bold text-[var(--rg-rust)]">₹4,500</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--rg-line)] text-[var(--rg-teal)]">
                <span className="font-bold">Refundable Balance:</span>
                <span className="font-bold">₹45,500</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('deposit_report')}
            className="mt-6 w-full py-2.5 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] rounded-lg text-xs font-bold rg-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Open Case Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingHero;
