'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileDown, Table2, AlertTriangle } from 'lucide-react';
import { cn, daysAgo } from '@/lib/utils';

export interface TenantSignal {
  id: string;
  tenant: string;
  unit: string;
  inactiveDays: number;
  riskScore: number; // 0-100
  primaryDriver: string;
  lastSeen: string;
}

const SIGNALS: TenantSignal[] = [
  { id: 'T-3391', tenant: 'A. Sharma', unit: 'B-204', inactiveDays: 14, riskScore: 82, primaryDriver: 'No app login', lastSeen: daysAgo(14) },
  { id: 'T-3392', tenant: 'R. Iyer', unit: 'A-101', inactiveDays: 3, riskScore: 21, primaryDriver: 'Payment on time', lastSeen: daysAgo(3) },
  { id: 'T-3393', tenant: 'K. Patel', unit: 'C-407', inactiveDays: 18, riskScore: 91, primaryDriver: 'Missed inspection RSVP', lastSeen: daysAgo(18) },
  { id: 'T-3394', tenant: 'S. Nair', unit: 'B-110', inactiveDays: 11, riskScore: 64, primaryDriver: 'Support ticket unresolved', lastSeen: daysAgo(11) },
  { id: 'T-3395', tenant: 'M. Verma', unit: 'A-305', inactiveDays: 2, riskScore: 12, primaryDriver: 'Active this week', lastSeen: daysAgo(2) },
];

function riskTier(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'HIGH', color: 'var(--rg-rust)' };
  if (score >= 45) return { label: 'WATCH', color: 'var(--rg-brass)' };
  return { label: 'STABLE', color: 'var(--rg-teal)' };
}

export function ChurnTelemetry() {
  const [sortByRisk, setSortByRisk] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const rows = useMemo(() => {
    const copy = [...SIGNALS];
    return sortByRisk ? copy.sort((a, b) => b.riskScore - a.riskScore) : copy;
  }, [sortByRisk]);

  const highRiskCount = SIGNALS.filter((s) => s.riskScore >= 75).length;

  function exportCSV() {
    const header = 'id,tenant,unit,inactive_days,risk_score,primary_driver,last_seen\n';
    const body = rows
      .map((r) => `${r.id},${r.tenant},${r.unit},${r.inactiveDays},${r.riskScore},"${r.primaryDriver}",${r.lastSeen}`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rentguard-churn-telemetry-${daysAgo(0)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <span className="rg-mono text-[11px] px-2 py-1 border border-[var(--rg-rust-dim)] text-[var(--rg-rust)] bg-[var(--rg-rust-dim)]/20">
            ML-15 · CHURN MODEL
          </span>
          <h3 className="rg-display text-xl mt-2">Tenant Inactivity Telemetry</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortByRisk((v) => !v)}
            className="flex items-center gap-1.5 rg-mono text-[11px] px-3 py-2 border border-[var(--rg-line-strong)] text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] transition-colors cursor-pointer"
          >
            <Table2 size={12} /> {sortByRisk ? 'SORTED BY RISK' : 'SORTED BY ID'}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rg-mono text-[11px] px-3 py-2 border border-[var(--rg-teal-dim)] text-[var(--rg-teal)] hover:bg-[var(--rg-teal-dim)]/20 transition-colors cursor-pointer"
          >
            <FileDown size={12} /> CSV
          </button>
          <button
            onClick={() => alert('PDF generation is in stub mode. Wired for production release.')}
            className="flex items-center gap-1.5 rg-mono text-[11px] px-3 py-2 border border-[var(--rg-brass-dim)] text-[var(--rg-brass)] hover:bg-[var(--rg-brass-dim)]/20 transition-colors cursor-pointer"
          >
            <FileDown size={12} /> AUDIT PDF
          </button>
        </div>
      </div>

      {highRiskCount > 0 && (
        <div className="flex items-center gap-2 mb-4 rg-mono text-xs text-[var(--rg-rust)] border border-[var(--rg-rust-dim)] bg-[var(--rg-rust-dim)]/15 px-3 py-2">
          <AlertTriangle size={13} />
          {highRiskCount} TENANT{highRiskCount > 1 ? 'S' : ''} FLAGGED HIGH-RISK — INACTIVE 10+ DAYS
        </div>
      )}

      <div className="border border-[var(--rg-line-strong)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="rg-mono text-[10px] text-[var(--rg-ink-dim)] bg-[var(--rg-surface-raised)]">
              <th className="px-3 py-2.5 font-medium border-b border-[var(--rg-line-strong)]">TENANT</th>
              <th className="px-3 py-2.5 font-medium border-b border-[var(--rg-line-strong)]">UNIT</th>
              <th className="px-3 py-2.5 font-medium border-b border-[var(--rg-line-strong)]">INACTIVE</th>
              <th className="px-3 py-2.5 font-medium border-b border-[var(--rg-line-strong)]">RISK</th>
              <th className="px-3 py-2.5 font-medium border-b border-[var(--rg-line-strong)]">PRIMARY DRIVER</th>
              <th className="px-3 py-2.5 font-medium border-b border-[var(--rg-line-strong)]">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tier = riskTier(row.riskScore);
              const isHighRisk = row.riskScore >= 75;
              return (
                <tr
                  key={row.id}
                  className="border-b border-[var(--rg-line)] last:border-b-0 hover:bg-[var(--rg-surface-raised)]/60 transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium">{row.tenant}</div>
                    <div className="rg-mono text-[10px] text-[var(--rg-ink-faint)]">{row.id}</div>
                  </td>
                  <td className="px-3 py-3 rg-mono text-xs text-[var(--rg-ink-dim)]">{row.unit}</td>
                  <td className="px-3 py-3 rg-mono text-xs">
                    {row.inactiveDays}d
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1 bg-[var(--rg-line)] overflow-hidden">
                        <div
                          className="h-full rg-bar-fill"
                          style={{ width: mounted ? `${row.riskScore}%` : '0%', backgroundColor: tier.color }}
                        />
                      </div>
                      <span className="rg-mono text-[11px] font-bold" style={{ color: tier.color }}>
                        {row.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-[var(--rg-ink-dim)]">{row.primaryDriver}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'rg-mono text-[10px] px-2 py-1 border inline-block font-bold',
                        isHighRisk && '-rotate-2'
                      )}
                      style={{
                        color: tier.color,
                        borderColor: tier.color,
                        backgroundColor: `${tier.color}1a`,
                      }}
                    >
                      {tier.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChurnTelemetry;
