'use client';

import { useState } from 'react';
import {
  FileCheck2,
  Printer,
  FileDown,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Coins,
  AlertTriangle,
  Scale,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';

export function DepositReportView() {
  const [whyExpanded, setWhyExpanded] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Financial values
  const originalDeposit = 50000;
  const estimatedDamage = 4500;
  const recommendedDeduction = 4500;
  const potentialRefund = originalDeposit - recommendedDeduction; // 45,500

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 600);
  };

  return (
    <div className="space-y-10 py-4">
      {/* ── Section Title & Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rg-line)] pb-5">
        <div>
          <span className="rg-mono text-[11px] px-2.5 py-1 border border-[var(--rg-teal-dim)] text-[var(--rg-teal)] bg-[rgba(75,156,147,0.12)] rounded-sm">
            FINAL SETTLEMENT AUDIT
          </span>
          <h2 className="rg-display text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] mt-2">
            Security Deposit &amp; Handover Report
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] text-[var(--rg-ink)] border border-[var(--rg-line-strong)] rounded-lg text-xs font-bold rg-mono flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[var(--rg-brass)]" />
            <span>Print / Export</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="px-5 py-2.5 bg-[var(--rg-brass)] hover:bg-[#e6b866] text-[#120d06] font-bold text-xs rg-mono rounded-lg shadow-[0_0_20px_rgba(201,154,75,0.3)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF…' : 'Generate Deposit Report'}</span>
          </button>
        </div>
      </div>

      {/* ── Security Deposit Financial Breakdown Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Original Deposit */}
        <div className="p-5 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-2 rg-glass-2">
          <span className="text-[10px] rg-mono font-bold uppercase text-[var(--rg-ink-faint)]">
            ORIGINAL SECURITY DEPOSIT
          </span>
          <div className="text-3xl font-bold text-[var(--rg-ink)] rg-mono">
            {formatINR(originalDeposit)}
          </div>
          <p className="text-[11px] text-[var(--rg-ink-dim)]">Deposited at lease start (Aug 2025)</p>
        </div>

        {/* Card 2: Estimated Damage Cost */}
        <div className="p-5 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-2 rg-glass-2">
          <span className="text-[10px] rg-mono font-bold uppercase text-[var(--rg-brass)]">
            ESTIMATED DAMAGE COST
          </span>
          <div className="text-3xl font-bold text-[var(--rg-brass)] rg-mono">
            {formatINR(estimatedDamage)}
          </div>
          <p className="text-[11px] text-[var(--rg-ink-dim)]">Kitchen counter resin chip repair</p>
        </div>

        {/* Card 3: Recommended Deduction */}
        <div className="p-5 rounded-2xl border border-[var(--rg-rust-dim)] bg-[rgba(193,85,61,0.06)] space-y-2 rg-glass-2">
          <span className="text-[10px] rg-mono font-bold uppercase text-[var(--rg-rust)]">
            RECOMMENDED DEDUCTION
          </span>
          <div className="text-3xl font-bold text-[var(--rg-rust)] rg-mono">
            {formatINR(recommendedDeduction)}
          </div>
          <p className="text-[11px] text-[var(--rg-ink-dim)]">Allowable under Model Tenancy Act</p>
        </div>

        {/* Card 4: Potential Refund */}
        <div className="p-5 rounded-2xl border-2 border-[var(--rg-teal)] bg-gradient-to-b from-[rgba(75,156,147,0.18)] to-[var(--rg-surface)] space-y-2 shadow-[0_0_25px_rgba(75,156,147,0.2)] rg-glass-1" data-glass-tint="teal">
          <div className="flex items-center justify-between">
            <span className="text-[10px] rg-mono font-bold uppercase text-[var(--rg-teal)]">
              POTENTIAL REFUND TO TENANT
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--rg-teal)] animate-pulse" />
          </div>
          <div className="text-3xl font-black text-[var(--rg-teal)] rg-mono">
            {formatINR(potentialRefund)}
          </div>
          <p className="text-[11px] font-semibold text-[var(--rg-teal)]/90">91% Deposit safely preserved</p>
        </div>
      </div>

      {/* ── Expandable "Why?" AI Evidence Breakdown ── */}
      <div className="rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] overflow-hidden shadow-xl rg-glass-2">
        <button
          onClick={() => setWhyExpanded((v) => !v)}
          className="w-full p-5 flex items-center justify-between bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(201,154,75,0.15)] border border-[var(--rg-brass-dim)] flex items-center justify-center text-[var(--rg-brass)] font-bold text-xs rg-mono">
              ?
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--rg-ink)] uppercase tracking-wide rg-mono">
                Why was ₹4,500 deducted and ₹45,500 refunded?
              </h3>
              <p className="text-xs text-[var(--rg-ink-dim)]">Click to expand statutory AI reasoning &amp; evidence ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold rg-mono text-[var(--rg-brass)]">
            <span>{whyExpanded ? 'Hide AI Evidence' : 'Expand "Why?" Breakdown'}</span>
            {whyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {whyExpanded && (
          <div className="p-6 space-y-6 border-t border-[var(--rg-line)] bg-[var(--rg-bg)]/80 animate-in fade-in duration-200">
            {/* Item 1: Wear & Tear (Zero Deduction) */}
            <div className="p-4 rounded-xl border border-[var(--rg-teal-dim)] bg-[rgba(75,156,147,0.06)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--rg-teal)]" />
                  <span className="font-bold text-xs text-[var(--rg-ink)]">Living Room Wall Scuff Marks</span>
                  <span className="px-2 py-0.5 text-[9px] rg-mono font-bold bg-[rgba(75,156,147,0.2)] text-[var(--rg-teal)] rounded">
                    NORMAL WEAR &amp; TEAR
                  </span>
                </div>
                <span className="rg-mono font-bold text-xs text-[var(--rg-teal)]">Deduction: ₹0</span>
              </div>
              <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed">
                Minor scuff marks at shoulder height are classified as normal wear &amp; tear resulting from ordinary living activities under Section 15(2) of the Indian Model Tenancy Act. Landlord cannot deduct for routine repainting.
              </p>
            </div>

            {/* Item 2: Accidental Impact (Deductible) */}
            <div className="p-4 rounded-xl border border-[var(--rg-rust-dim)] bg-[rgba(193,85,61,0.06)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--rg-rust)]" />
                  <span className="font-bold text-xs text-[var(--rg-ink)]">Kitchen Granite Countertop Chip</span>
                  <span className="px-2 py-0.5 text-[9px] rg-mono font-bold bg-[rgba(193,85,61,0.2)] text-[var(--rg-rust)] rounded">
                    TENANT DAMAGE
                  </span>
                </div>
                <span className="rg-mono font-bold text-xs text-[var(--rg-rust)]">Deduction: ₹4,500</span>
              </div>
              <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed">
                Physical impact fracture exceeds ordinary aging thresholds. Quoted according to verified local stone-mason repair index (resin fill + diamond bevel polish). Pro-rated against 10-year asset life cycle.
              </p>
            </div>

            {/* Item 3: Bedroom Sunlight Aging (Zero Deduction) */}
            <div className="p-4 rounded-xl border border-[var(--rg-teal-dim)] bg-[rgba(75,156,147,0.06)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--rg-teal)]" />
                  <span className="font-bold text-xs text-[var(--rg-ink)]">Bedroom Window Paint Sun-Fading</span>
                  <span className="px-2 py-0.5 text-[9px] rg-mono font-bold bg-[rgba(75,156,147,0.2)] text-[var(--rg-teal)] rounded">
                    NORMAL WEAR &amp; TEAR
                  </span>
                </div>
                <span className="rg-mono font-bold text-xs text-[var(--rg-teal)]">Deduction: ₹0</span>
              </div>
              <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed">
                UV exposure over 12 months causes inevitable paint fading. Landlord turnover maintenance responsibility.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Evidence Timeline ── */}
      <div className="p-6 rounded-2xl border border-[var(--rg-line-strong)] bg-[var(--rg-surface)] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--rg-line)]">
          <h3 className="text-base font-bold text-[var(--rg-ink)] rg-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--rg-brass)]" />
            Audit Evidence Timeline
          </h3>
          <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)]">IMMUTABLE BLOCKCHAIN-STAMPED LOG</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[var(--rg-surface-raised)] border border-[var(--rg-teal-dim)] space-y-1.5">
            <div className="text-[10px] rg-mono font-bold text-[var(--rg-teal)]">1. MOVE-IN (AUG 15, 2025)</div>
            <p className="text-xs font-bold text-[var(--rg-ink)]">Baseline Recorded</p>
            <p className="text-[11px] text-[var(--rg-ink-dim)]">5 rooms photographed with geo-timestamp.</p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[var(--rg-surface-raised)] border border-[var(--rg-line-strong)] space-y-1.5">
            <div className="text-[10px] rg-mono font-bold text-[var(--rg-ink-faint)]">2. TENANCY TERM</div>
            <p className="text-xs font-bold text-[var(--rg-ink)]">12 Months Occupancy</p>
            <p className="text-[11px] text-[var(--rg-ink-dim)]">Regular rent paid on time. No interim damage.</p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[var(--rg-surface-raised)] border border-[var(--rg-rust-dim)] space-y-1.5">
            <div className="text-[10px] rg-mono font-bold text-[var(--rg-rust)]">3. MOVE-OUT (AUG 20, 2026)</div>
            <p className="text-xs font-bold text-[var(--rg-ink)]">Exit Photos Captured</p>
            <p className="text-[11px] text-[var(--rg-ink-dim)]">End-of-lease photography uploaded.</p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-[var(--rg-surface-raised)] border border-[var(--rg-brass-dim)] space-y-1.5">
            <div className="text-[10px] rg-mono font-bold text-[var(--rg-brass)]">4. AI DELTA SCAN</div>
            <p className="text-xs font-bold text-[var(--rg-ink)]">Damage Scored</p>
            <p className="text-[11px] text-[var(--rg-ink-dim)]">1 damage item isolated (Countertop chip).</p>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-xl bg-[var(--rg-surface-raised)] border-2 border-[var(--rg-teal)] bg-[rgba(75,156,147,0.08)] space-y-1.5">
            <div className="text-[10px] rg-mono font-bold text-[var(--rg-teal)]">5. DEPOSIT REPORT</div>
            <p className="text-xs font-bold text-[var(--rg-teal)]">₹45,500 Refund</p>
            <p className="text-[11px] text-[var(--rg-ink-dim)]">Final report generated and certified.</p>
          </div>
        </div>
      </div>

      {/* ── Final Case Dossier Report Document Preview ── */}
      <div className="p-8 sm:p-10 rounded-2xl border-2 border-[var(--rg-brass-dim)] bg-[#101413] shadow-2xl space-y-8 print:border-none print:shadow-none">
        {/* Dossier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--rg-line-strong)]">
          <div>
            <span className="text-[10px] rg-mono font-bold tracking-widest text-[var(--rg-brass)] uppercase">
              CERTIFIED FORENSIC INSPECTION DOSSIER
            </span>
            <h3 className="rg-display text-2xl font-bold text-[var(--rg-ink)] mt-1">
              Move-Out Deposit Settlement Certificate
            </h3>
            <p className="text-xs rg-mono text-[var(--rg-ink-dim)]">
              Issued under RentGuard AI Protocol · Compliance ID: RG-IND-2026-0417
            </p>
          </div>

          {/* Forensic verification badge */}
          <div className="px-4 py-2 rounded-xl bg-[var(--rg-surface-raised)] border border-[var(--rg-brass-dim)] text-right">
            <span className="text-[10px] rg-mono text-[var(--rg-ink-faint)] block">SETTLEMENT STATUS</span>
            <span className="text-sm font-bold rg-mono text-[var(--rg-teal)] flex items-center justify-end gap-1">
              <CheckCircle2 className="w-4 h-4" /> AUDIT CERTIFIED
            </span>
          </div>
        </div>

        {/* Case Metadata Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--rg-surface)] border border-[var(--rg-line)] text-xs rg-mono">
          <div>
            <span className="text-[var(--rg-ink-faint)] block">PROPERTY:</span>
            <span className="font-bold text-[var(--rg-ink)]">Tower 4, Flat 1204, CyberCity</span>
          </div>
          <div>
            <span className="text-[var(--rg-ink-faint)] block">TENANT:</span>
            <span className="font-bold text-[var(--rg-ink)]">Aditi Sharma</span>
          </div>
          <div>
            <span className="text-[var(--rg-ink-faint)] block">TENANCY DURATION:</span>
            <span className="font-bold text-[var(--rg-ink)]">Aug 2025 – Aug 2026</span>
          </div>
          <div>
            <span className="text-[var(--rg-ink-faint)] block">RECOMMENDED REFUND:</span>
            <span className="font-bold text-[var(--rg-teal)]">₹45,500 (91%)</span>
          </div>
        </div>

        {/* Final Recommendation Paragraph */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase rg-mono text-[var(--rg-brass)]">
            EXECUTIVE SETTLEMENT RECOMMENDATION:
          </h4>
          <p className="text-xs text-[var(--rg-ink-dim)] leading-relaxed bg-[var(--rg-surface)] p-4 rounded-xl border border-[var(--rg-line)]">
            Based on direct photographic delta comparison between August 15, 2025 baseline records and August 20, 2026 exit photography, 4 out of 5 inspected areas exhibit only normal wear and tear. The single legitimate deduction comprises <strong>₹4,500</strong> for localized granite counter repair in the kitchen. Landlord is instructed to refund <strong>₹45,500</strong> to the tenant within the statutory 14-day window.
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-[var(--rg-line-strong)] flex flex-wrap items-center justify-between gap-4">
          <div className="text-[11px] rg-mono text-[var(--rg-ink-faint)]">
            RentGuard AI · Legally binding record under Section 15 of the Indian Model Tenancy Act
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[var(--rg-surface-raised)] hover:bg-[var(--rg-surface)] text-[var(--rg-ink)] border border-[var(--rg-line-strong)] rounded-lg text-xs font-bold rg-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[var(--rg-brass)]" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={handleGenerateReport}
              className="px-5 py-2 bg-[var(--rg-teal)] hover:bg-[#5db4aa] text-[#0b0d0c] font-bold text-xs rg-mono rounded-lg shadow-[0_0_15px_rgba(75,156,147,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositReportView;
