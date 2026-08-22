'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileCheck2,
  Calendar,
  Building,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Scale,
  Download,
} from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';

interface HistoricalInspection {
  id: string;
  property: string;
  unit: string;
  tenant: string;
  date: string;
  type: 'Move-Out Audit' | 'Move-In Baseline' | 'Interim Check';
  overallCondition: 'Excellent' | 'Good' | 'Minor Wear' | 'Damages Present';
  originalDeposit: number;
  depositImpact: number;
  status: 'Completed' | 'In Review' | 'Settled' | 'Disputed';
  findingsCount: number;
  summary: string;
}

const HISTORICAL_INSPECTIONS: HistoricalInspection[] = [
  {
    id: 'CASE-2026-0417',
    property: 'DLF CyberCity Towers',
    unit: 'Tower 4, Flat 1204',
    tenant: 'Aditi Sharma',
    date: '2026-08-20',
    type: 'Move-Out Audit',
    overallCondition: 'Minor Wear',
    originalDeposit: 50000,
    depositImpact: 4500,
    status: 'Completed',
    findingsCount: 3,
    summary: 'Living room scuff marks classified as wear & tear. Kitchen countertop chip isolated with ₹4,500 repair deduction. ₹45,500 refund approved.',
  },
  {
    id: 'CASE-2025-0815',
    property: 'DLF CyberCity Towers',
    unit: 'Tower 4, Flat 1204',
    tenant: 'Aditi Sharma',
    date: '2025-08-15',
    type: 'Move-In Baseline',
    overallCondition: 'Excellent',
    originalDeposit: 50000,
    depositImpact: 0,
    status: 'Settled',
    findingsCount: 5,
    summary: 'Full photographic baseline locked for 5 rooms. Fresh paint, no pre-existing defects.',
  },
  {
    id: 'CASE-2025-0310',
    property: 'Golf Course Road Estate',
    unit: 'Villa 8, Sector 42',
    tenant: 'Rohan Iyer',
    date: '2025-03-10',
    type: 'Move-Out Audit',
    overallCondition: 'Excellent',
    originalDeposit: 90000,
    depositImpact: 0,
    status: 'Settled',
    findingsCount: 6,
    summary: 'Full deposit refund of ₹90,000 processed. Zero tenant damages identified across 6 audited rooms.',
  },
  {
    id: 'CASE-2024-1102',
    property: 'MG Road Residency',
    unit: 'Flat 2B, Block C',
    tenant: 'Kabir Patel',
    date: '2024-11-02',
    type: 'Move-Out Audit',
    overallCondition: 'Damages Present',
    originalDeposit: 60000,
    depositImpact: 12000,
    status: 'Completed',
    findingsCount: 4,
    summary: 'Bathroom floor tile cracked and door handle broken. ₹12,000 deduction verified by contractor estimate.',
  },
  {
    id: 'CASE-2024-0618',
    property: 'Sohna Road Heights',
    unit: 'Unit 902, Tower 1',
    tenant: 'Sneha Nair',
    date: '2024-06-18',
    type: 'Move-Out Audit',
    overallCondition: 'Minor Wear',
    originalDeposit: 40000,
    depositImpact: 0,
    status: 'Settled',
    findingsCount: 3,
    summary: 'All findings deemed normal wear & tear. Full deposit returned without mediation.',
  },
];

export function InspectionHistoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Settled' | 'Disputed'>('All');
  const [selectedInspection, setSelectedInspection] = useState<HistoricalInspection | null>(null);

  const filteredInspections = useMemo(() => {
    return HISTORICAL_INSPECTIONS.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tenant.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Settled':
      case 'Completed':
        return 'bg-[rgba(75,156,147,0.15)] text-[var(--rg-teal)] border-[var(--rg-teal-dim)]';
      case 'In Review':
        return 'bg-[rgba(201,154,75,0.15)] text-[var(--rg-brass)] border-[var(--rg-brass-dim)]';
      case 'Disputed':
      default:
        return 'bg-[rgba(193,85,61,0.15)] text-[var(--rg-rust)] border-[var(--rg-rust-dim)]';
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rg-line)] pb-5">
        <div>
          <span className="rg-mono text-[11px] px-2.5 py-1 border border-[var(--rg-brass-dim)] text-[var(--rg-brass)] bg-[var(--rg-brass-dim)]/20 rounded-sm">
            IMMUTABLE ARCHIVE
          </span>
          <h2 className="rg-display text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] mt-2">
            Inspection History &amp; Case Archive
          </h2>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[var(--rg-ink-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case, property, tenant…"
              className="w-full bg-[var(--rg-surface)] border border-[var(--rg-line-strong)] pl-9 pr-3 py-2 text-xs rg-mono text-[var(--rg-ink)] rounded-lg outline-none focus:border-[var(--rg-brass)]"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 p-1 bg-[var(--rg-surface)] border border-[var(--rg-line-strong)] rounded-lg text-xs rg-mono">
            {(['All', 'Completed', 'Settled', 'Disputed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'px-2.5 py-1 rounded transition-all cursor-pointer font-semibold',
                  statusFilter === st
                    ? 'bg-[var(--rg-brass)] text-black font-bold'
                    : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)]'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table & Cards of Historical Inspections ── */}
      <div className="border border-[var(--rg-line-strong)] rounded-2xl overflow-hidden bg-[var(--rg-surface)] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--rg-surface-raised)] border-b border-[var(--rg-line-strong)] text-[10px] rg-mono text-[var(--rg-ink-dim)]">
                <th className="px-5 py-3.5 font-bold">CASE ID &amp; DATE</th>
                <th className="px-5 py-3.5 font-bold">PROPERTY &amp; UNIT</th>
                <th className="px-5 py-3.5 font-bold">TENANT</th>
                <th className="px-5 py-3.5 font-bold">INSPECTION TYPE</th>
                <th className="px-5 py-3.5 font-bold">CONDITION</th>
                <th className="px-5 py-3.5 font-bold">DEPOSIT IMPACT</th>
                <th className="px-5 py-3.5 font-bold">STATUS</th>
                <th className="px-5 py-3.5 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rg-line)] text-xs">
              {filteredInspections.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedInspection(item)}
                  className="hover:bg-[var(--rg-surface-raised)]/70 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-4">
                    <div className="font-bold text-[var(--rg-ink)] rg-mono">{item.id}</div>
                    <div className="text-[10px] rg-mono text-[var(--rg-ink-faint)] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-[var(--rg-ink)]">{item.property}</div>
                    <div className="text-[11px] text-[var(--rg-ink-dim)] rg-mono">{item.unit}</div>
                  </td>

                  <td className="px-5 py-4 text-[var(--rg-ink)] font-medium">
                    {item.tenant}
                  </td>

                  <td className="px-5 py-4 rg-mono text-[11px] text-[var(--rg-ink-dim)]">
                    {item.type}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'text-[10px] rg-mono font-bold px-2 py-0.5 rounded border',
                        item.overallCondition === 'Excellent'
                          ? 'bg-[rgba(75,156,147,0.12)] text-[var(--rg-teal)] border-[var(--rg-teal-dim)]'
                          : item.overallCondition === 'Minor Wear'
                          ? 'bg-[rgba(201,154,75,0.12)] text-[var(--rg-brass)] border-[var(--rg-brass-dim)]'
                          : 'bg-[rgba(193,85,61,0.12)] text-[var(--rg-rust)] border-[var(--rg-rust-dim)]'
                      )}
                    >
                      {item.overallCondition}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="rg-mono font-bold text-sm text-[var(--rg-ink)]">
                      {formatINR(item.depositImpact)}
                    </div>
                    <div className="text-[10px] rg-mono text-[var(--rg-teal)]">
                      Refund: {formatINR(item.originalDeposit - item.depositImpact)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'text-[10px] rg-mono font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1',
                        getStatusBadge(item.status)
                      )}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInspection(item);
                      }}
                      className="px-3 py-1.5 bg-[var(--rg-surface-raised)] group-hover:bg-[var(--rg-brass)] group-hover:text-black text-[var(--rg-brass)] border border-[var(--rg-brass-dim)] rounded-lg text-xs font-bold rg-mono inline-flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-Out / Modal Detail View for Selected Case ── */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[var(--rg-surface)] border-2 border-[var(--rg-brass-dim)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedInspection(null)}
              className="absolute top-4 right-4 text-[var(--rg-ink-faint)] hover:text-[var(--rg-ink)] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] rg-mono text-[var(--rg-brass)] font-bold uppercase tracking-wider">
                HISTORICAL CASE AUDIT DOSSIER
              </span>
              <h3 className="text-2xl font-bold text-[var(--rg-ink)] rg-display">
                {selectedInspection.id} — {selectedInspection.property}
              </h3>
              <p className="text-xs rg-mono text-[var(--rg-ink-dim)]">
                {selectedInspection.unit} · Tenant: {selectedInspection.tenant} · Date: {selectedInspection.date}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--rg-surface-raised)] rounded-xl border border-[var(--rg-line)] text-xs rg-mono">
              <div>
                <span className="text-[var(--rg-ink-faint)] block text-[10px]">ORIGINAL DEPOSIT:</span>
                <span className="text-base font-bold text-[var(--rg-ink)]">{formatINR(selectedInspection.originalDeposit)}</span>
              </div>
              <div>
                <span className="text-[var(--rg-ink-faint)] block text-[10px]">VERIFIED DEDUCTION:</span>
                <span className="text-base font-bold text-[var(--rg-rust)]">{formatINR(selectedInspection.depositImpact)}</span>
              </div>
              <div>
                <span className="text-[var(--rg-ink-faint)] block text-[10px]">FINAL REFUND:</span>
                <span className="text-base font-bold text-[var(--rg-teal)]">
                  {formatINR(selectedInspection.originalDeposit - selectedInspection.depositImpact)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase rg-mono text-[var(--rg-ink-dim)]">AUDIT SUMMARY:</span>
              <p className="text-xs text-[var(--rg-ink)] leading-relaxed bg-[var(--rg-bg)] p-4 rounded-xl border border-[var(--rg-line)]">
                {selectedInspection.summary}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[var(--rg-surface-raised)] text-[var(--rg-ink)] border border-[var(--rg-line-strong)] rounded-lg text-xs font-bold rg-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[var(--rg-brass)]" />
                <span>Export Audit PDF</span>
              </button>
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-5 py-2 bg-[var(--rg-brass)] text-[#120d06] font-bold text-xs rg-mono rounded-lg cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InspectionHistoryView;
