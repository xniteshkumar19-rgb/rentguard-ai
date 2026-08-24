"use client";

import { useState, useMemo } from "react";
import { ChurnUser, ChurnRiskLevel } from "@/types";
import {
  MOCK_CHURN_METRICS,
  MOCK_FEATURE_IMPORTANCE,
  MOCK_CHURN_USERS,
} from "@/lib/churnData";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Brain,
  Zap,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  Search,
  Mail,
  Send,
  BarChart3,
  Activity,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

export function AdminChurnDashboard() {
  const [users, setUsers] = useState<ChurnUser[]>(MOCK_CHURN_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<
    "All" | ChurnRiskLevel
  >("All");
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [lastCampaignNotice, setLastCampaignNotice] = useState<string | null>(
    null
  );

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRisk =
        selectedRiskFilter === "All" || user.riskLevel === selectedRiskFilter;
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.primaryRiskDriver.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRisk && matchesSearch;
    });
  }, [users, selectedRiskFilter, searchQuery]);

  const pendingInterventionsCount = users.filter(
    (u) => u.status === "Pending Action" && u.riskLevel === "High"
  ).length;

  // Trigger batch automated retention campaign
  const handleTriggerCampaign = () => {
    setIsCampaignRunning(true);
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.riskLevel === "High" && u.status === "Pending Action") {
            return {
              ...u,
              status: "Intervention Sent",
              deletionRiskScore: Math.max(15, u.deletionRiskScore - 35),
            };
          }
          return u;
        })
      );
      setIsCampaignRunning(false);
      setLastCampaignNotice(
        `Automated ML Retention Campaign Dispatched: Targeted ${pendingInterventionsCount} high-risk account(s) with customized renewal incentives and priority dispute concierge support.`
      );
    }, 900);
  };

  // Trigger individual user intervention
  const handleIndividualIntervene = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus =
            u.status === "Pending Action" ? "Intervention Sent" : "Risk Mitigated";
          const newScore = Math.max(10, u.deletionRiskScore - 30);
          return {
            ...u,
            status: newStatus,
            deletionRiskScore: newScore,
            riskLevel: newScore >= 70 ? "High" : newScore >= 40 ? "Medium" : "Low",
          };
        }
        return u;
      })
    );
    const target = users.find((u) => u.id === userId);
    if (target) {
      setLastCampaignNotice(
        `Proactive intervention triggered for ${target.name}: "${target.recommendedAction}" sent.`
      );
    }
  };

  // Reset demo data
  const handleResetData = () => {
    setUsers(MOCK_CHURN_USERS);
    setLastCampaignNotice(null);
  };

  return (
    <div className="px-4 py-4 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      {/* ── Top Hero Banner with Gradient Glow ────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-6 md:p-8 text-white shadow-2xl border border-indigo-500/30">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-sm shadow-indigo-500/10">
                <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                XGBoost Churn Classifier (ML-15)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Activity className="w-3.5 h-3.5" /> 94.2% ROC-AUC
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Admin ML Churn &amp; Account Deletion Dashboard
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time predictive telemetry evaluating tenant and landlord account
              attrition probability. Automatic trigger matrix intercepts high-risk
              users before account termination.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerCampaign}
              disabled={isCampaignRunning || pendingInterventionsCount === 0}
              className={cn(
                "flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm text-white shadow-xl transition-all duration-300",
                pendingInterventionsCount > 0
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 border border-indigo-400/30 shadow-purple-500/25 active:scale-95"
                  : "bg-slate-800/80 text-slate-400 border border-slate-700 cursor-not-allowed"
              )}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isCampaignRunning
                  ? "Dispatching Retention Offers..."
                  : pendingInterventionsCount > 0
                  ? `⚡ Trigger Automated Retention Campaign (${pendingInterventionsCount} High Risk)`
                  : "All High-Risk Accounts Intervened"}
              </span>
            </button>

            <button
              onClick={handleResetData}
              title="Reset Sample Data"
              className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Feedback Notification Toast ───────────────────────── */}
      {lastCampaignNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start justify-between gap-3 animate-slide-up shadow-xl shadow-emerald-500/10">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-bold leading-relaxed">
              {lastCampaignNotice}
            </p>
          </div>
          <button
            onClick={() => setLastCampaignNotice(null)}
            className="text-xs font-black text-emerald-400 hover:text-emerald-200 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Executive Overview KPI Grid (4 Cards) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {MOCK_CHURN_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between space-y-3 transition-all group rg-glass-1 rg-glass-hover"
            data-glass-tint="rust"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {metric.title}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white group-hover:text-indigo-400 transition-colors">
                  {metric.value}
                </span>
                <span
                  className={cn(
                    "text-xs font-black flex items-center",
                    metric.isPositiveTrend
                      ? "text-emerald-400"
                      : "text-red-400"
                  )}
                >
                  {metric.isPositiveTrend ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                  )}
                  {metric.change}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 truncate font-medium">
              {metric.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* ── ML Telemetry & Feature Importance Panel ───────────── */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4 rg-glass-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                ML Feature Importance &amp; Deletion Signal Weights
              </h3>
              <p className="text-xs text-slate-400">
                SHAP values indicating top features influencing the XGBoost prediction
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-bold self-start sm:self-center">
            Weighted GBDT Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_FEATURE_IMPORTANCE.map((item) => (
            <div
              key={item.feature}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">
                    {item.feature}
                  </span>
                  <span className="text-xs font-black text-indigo-400 font-mono">
                    {item.weight}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 shadow-[0_0_8px_#6366f1]"
                    style={{ width: `${item.weight}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interactive User Risk Table with Glowing Badges ───── */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Real-Time User Account Risk Registry
            </h3>
            <p className="text-xs text-slate-400">
              Users ranked by churn probability with automated ML recommended interventions
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(["All", "High", "Medium", "Low"] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRiskFilter(risk)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap",
                selectedRiskFilter === risk
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
              )}
            >
              {risk === "All" && `All Accounts (${users.length})`}
              {risk === "High" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>High Risk ({users.filter((u) => u.riskLevel === "High").length})</span>
                </>
              )}
              {risk === "Medium" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Medium Risk ({users.filter((u) => u.riskLevel === "Medium").length})</span>
                </>
              )}
              {risk === "Low" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Healthy ({users.filter((u) => u.riskLevel === "Low").length})</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* User Rows */}
        <div className="divide-y divide-slate-800/80">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No user accounts found matching your filter criteria.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isHighRisk = user.riskLevel === "High";
              const isOver10Days = user.daysInactive >= 10;

              return (
                <div
                  key={user.id}
                  className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/30 rounded-2xl px-3 transition-colors"
                >
                  {/* User Profile */}
                  <div className="flex items-start gap-3 min-w-[240px]">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black flex items-center justify-center text-xs flex-shrink-0 shadow-lg border border-white/10">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold text-white">
                          {user.name}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                          {user.plan}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry: Inactivity & Friction */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Inactivity
                      </span>
                      <p className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {user.daysInactive} days
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Friction Score
                      </span>
                      <p
                        className={cn(
                          "font-black mt-0.5",
                          user.supportFrictionScore >= 7
                            ? "text-red-400"
                            : user.supportFrictionScore >= 4
                            ? "text-amber-400"
                            : "text-emerald-400"
                        )}
                      >
                        {user.supportFrictionScore.toFixed(1)} / 10
                      </p>
                    </div>
                  </div>

                  {/* Risk Badge & Driver */}
                  <div className="min-w-[220px] space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* PULSING GLOWING BADGE FOR HIGH CHURN WARNING (10+ Days Inactive) */}
                      {isHighRisk && isOver10Days ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-950/80 text-red-300 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                          <Flame className="w-3.5 h-3.5 text-red-400" />
                          ⚠️ HIGH CHURN WARNING (10+ Days Inactive)
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-black border",
                            user.riskLevel === "High"
                              ? "bg-red-950/60 text-red-400 border-red-500/40"
                              : user.riskLevel === "Medium"
                              ? "bg-amber-950/60 text-amber-400 border-amber-500/40"
                              : "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          )}
                        >
                          {user.deletionRiskScore}% Deletion Risk
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 truncate max-w-sm">
                      <span className="text-slate-500 font-mono">Driver:</span>{" "}
                      {user.primaryRiskDriver}
                    </p>
                  </div>

                  {/* Recommended Action & Intervention Button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleIndividualIntervene(user.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95",
                        user.status === "Pending Action"
                          ? user.riskLevel === "High"
                            ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/20 border border-red-400/30"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 border border-indigo-400/30"
                          : user.status === "Intervention Sent"
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm"
                          : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm"
                      )}
                    >
                      {user.status === "Pending Action" ? (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Intervene</span>
                        </>
                      ) : user.status === "Intervention Sent" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Offer Dispatched</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Retained</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminChurnDashboard;

