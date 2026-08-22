"use client";

import { UserPersona, AppMode } from "@/types";
import {
  Shield,
  Brain,
  Camera,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  TrendingUp,
  BarChart3,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoAuthModalProps {
  isOpen: boolean;
  onSelectPersona: (persona: UserPersona, targetMode: AppMode) => void;
  onClose?: () => void;
}

export function DemoAuthModal({
  isOpen,
  onSelectPersona,
  onClose,
}: DemoAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto">
      {/* Background Animated Gradient Mesh Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-mesh-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-mesh-float" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full my-auto space-y-6 animate-slide-up">
        {/* Header / Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Hackathon 2026 Special Judge Demo
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 border border-white/20">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                RentGuard AI
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  SaaS Pro
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Visual Real Estate Intelligence & Predictive ML Churn Risk Platform
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Welcome Hackathon Judges! Select a test persona below to explore the
            real-time computer vision auditor or the predictive ML churn suite.
          </p>
        </div>

        {/* Demo Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Persona 1: Tenant (Property Scanner) */}
          <div className="group relative rounded-2xl p-5 bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  Vision AI Mode
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  Tenant Persona
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Alex Mercer (alex@example.com)
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Photograph wall scuffs & damage for deposit protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Instant legal &ldquo;Wear &amp; Tear&rdquo; vs &ldquo;Tenant Damage&rdquo; reasoning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Room photo to Zillow/FB Marketplace copy generation</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPersona("tenant", "move_out")}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all"
            >
              <span>Login as Tenant (Property Scanner)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Persona 2: Property Manager (Admin ML) */}
          <div className="group relative rounded-2xl p-5 bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  ML Churn Suite
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Property Manager (Admin)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sarah Lin (sarah.lin@rentalhub.org)
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>XGBoost ML model predicting 30-day account deletions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>Pulsing ⚠️ HIGH CHURN warnings (10+ days inactive)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>1-Click automated retention intervention campaigns</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPersona("manager", "admin")}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-98 transition-all"
            >
              <span>Login as Manager (Admin ML)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            Next.js App Router
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            GPT-4o Vision API
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            XGBoost ML Classifier
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            Zero-Key Offline Demo
          </span>
        </div>
      </div>
    </div>
  );
}
