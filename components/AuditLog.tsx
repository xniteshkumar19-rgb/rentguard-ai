"use client";

import { AuditLogItem } from "@/types";
import { cn, formatUSD, formatTimestamp } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Printer,
  ClipboardList,
  DollarSign,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import Image from "next/image";

interface AuditLogProps {
  items: AuditLogItem[];
  onClear: () => void;
}

export function AuditLog({ items, onClear }: AuditLogProps) {
  // Calculate cumulative deductible total (only Tenant Damage items)
  const totalDeductible = items.reduce((sum, item) => {
    if (item.result.classification === "Tenant Damage") {
      const avg =
        (item.result.repair_cost_low + item.result.repair_cost_high) / 2;
      return sum + avg;
    }
    return sum;
  }, 0);

  const tenantDamageCount = items.filter(
    (i) => i.result.classification === "Tenant Damage"
  ).length;

  const handlePrint = () => {
    window.print();
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-3 max-w-xl mx-auto w-full">
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 flex flex-col items-center gap-2 text-center">
          <ClipboardList className="w-8 h-8 text-slate-600" />
          <p className="text-sm font-bold text-slate-400">
            Inspection Ledger Empty
          </p>
          <p className="text-xs text-slate-500 max-w-xs">
            Capture or upload a defect above, analyze it with Vision AI, and click &ldquo;Save Defect to Inspection Audit Log&rdquo;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 max-w-xl mx-auto w-full space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-black text-white">
            Active Inspection Audit Log
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
            {items.length} logged
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Ledger Card */}
      <div
        className={cn(
          "p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-4 shadow-xl",
          tenantDamageCount > 0
            ? "bg-gradient-to-r from-red-950/50 via-slate-900/90 to-slate-900/90 border-red-500/30"
            : "bg-gradient-to-r from-emerald-950/50 via-slate-900/90 to-slate-900/90 border-emerald-500/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
              tenantDamageCount > 0
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            )}
          >
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Estimated Deposit Deduction
            </span>
            <p
              className={cn(
                "text-xl sm:text-2xl font-black mt-0.5",
                tenantDamageCount > 0 ? "text-red-400" : "text-emerald-400"
              )}
            >
              {formatUSD(totalDeductible)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono">Breakdown</span>
          <p className="text-xs font-bold text-white mt-0.5">
            <span className="text-red-400">{tenantDamageCount} Damage</span> •{" "}
            <span className="text-emerald-400">
              {items.length - tenantDamageCount} Wear &amp; Tear
            </span>
          </p>
        </div>
      </div>

      {/* Log Items Grid */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isWear = item.result.classification === "Normal Wear & Tear";
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3 transition-colors"
            >
              <span className="text-xs font-mono font-bold text-slate-500 w-4">
                #{index + 1}
              </span>

              {/* Thumbnail */}
              <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 relative border border-slate-800">
                <Image
                  src={item.imagePreview}
                  alt={item.result.defect_type}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {item.result.defect_type}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded",
                      isWear
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    )}
                  >
                    {item.result.classification}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatTimestamp(new Date(item.timestamp))}
                  </span>
                </div>
              </div>

              {/* Cost Indicator */}
              <div className="text-right flex-shrink-0">
                <p
                  className={cn(
                    "text-xs font-black",
                    isWear ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {isWear
                    ? "$0 (Protected)"
                    : `~${formatUSD(
                        (item.result.repair_cost_low +
                          item.result.repair_cost_high) /
                          2
                      )}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
