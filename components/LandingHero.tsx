"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  Shield,
  Sparkles,
  ArrowRight,
  Camera,
  Brain,
  ArrowLeftRight,
  Users,
  CheckCircle2,
  Zap,
} from "lucide-react";

export function LandingHero() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleDemoLogin = async (role: "tenant" | "manager") => {
    setIsLoading(role);
    await signIn("credentials", {
      role,
      callbackUrl: "/dashboard",
    });
  };

  const features = [
    {
      icon: Camera,
      color: "blue",
      title: "Damage Audit AI",
      desc: "GPT-4o vision classifies defects as Wear & Tear vs. Tenant Damage with legal reasoning",
    },
    {
      icon: ArrowLeftRight,
      color: "purple",
      title: "Delta Comparison",
      desc: "Upload Move-In + Move-Out photos. Interactive slider reveals new damages vs pre-existing.",
    },
    {
      icon: Sparkles,
      color: "emerald",
      title: "Listing Generator",
      desc: "Auto-generate Zillow & Facebook Marketplace ready copy from a single room photo.",
    },
    {
      icon: Brain,
      color: "rose",
      title: "ML Churn Suite",
      desc: "XGBoost ML model predicting 30-day account deletions with automated retention interventions.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl animate-mesh-float" />
        <div
          className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl animate-mesh-float"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-3/4 left-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl animate-mesh-float"
          style={{ animationDelay: "6s" }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-4xl w-full space-y-12 animate-fade-in">
        {/* Top Badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 tracking-wider uppercase shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Hackathon 2026 · AI Property Intelligence Suite
          </span>
        </div>

        {/* Hero Headline */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-slate-900" fill="currentColor" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
            RentGuard{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Visual property intelligence platform — damage auditing, before/after comparison, rent listing generation, and predictive ML churn risk.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 backdrop-blur-xl transition-all group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                  color === "blue"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : color === "purple"
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    : color === "emerald"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-black text-white mb-1">{title}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* Auth Glassmorphic Card */}
        <div className="max-w-md mx-auto w-full">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-700/80 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">
                Get Started
              </h2>
              <p className="text-xs text-slate-400">
                Sign in with Google or use a hackathon demo account
              </p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm transition-all shadow-xl shadow-black/30 border border-white/20 disabled:opacity-60 active:scale-98"
            >
              {isLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Sign in with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-[11px] text-slate-500 font-semibold">or use demo account</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* Demo Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin("tenant")}
                disabled={isLoading !== null}
                className="flex flex-col items-center gap-2 py-3 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-all group disabled:opacity-60"
              >
                {isLoading === "tenant" ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-center">
                  <p className="text-[11px] font-black">Tenant Demo</p>
                  <p className="text-[10px] text-blue-400/70">Property Scanner</p>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin("manager")}
                disabled={isLoading !== null}
                className="flex flex-col items-center gap-2 py-3 px-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-all group disabled:opacity-60"
              >
                {isLoading === "manager" ? (
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-center">
                  <p className="text-[11px] font-black">Manager Demo</p>
                  <p className="text-[10px] text-purple-400/70">Admin ML Churn</p>
                </div>
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-500 pt-1">
              Demo accounts require no setup. Google login requires OAuth credentials in .env.local
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
