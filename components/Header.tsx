"use client";

import { AppMode } from "@/types";
import { cn } from "@/lib/utils";
import {
  Shield,
  Home,
  Brain,
  Camera,
  ArrowLeftRight,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems: { id: AppMode; label: string; shortLabel: string; icon: typeof Camera; color: string }[] = [
    { id: "move_out", label: "Damage Audit", shortLabel: "Audit", icon: Shield, color: "blue" },
    { id: "delta", label: "Delta Compare", shortLabel: "Delta", icon: ArrowLeftRight, color: "purple" },
    { id: "listing", label: "Listing Gen", shortLabel: "Listing", icon: Home, color: "emerald" },
    { id: "admin", label: "Admin ML", shortLabel: "ML", icon: Brain, color: "rose" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={() => onModeChange("move_out")}
          className="flex items-center gap-2 group flex-shrink-0"
        >
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <span className="hidden sm:block text-sm font-black text-white tracking-tight">
            RentGuard <span className="text-indigo-400">AI</span>
          </span>
        </button>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner flex-1 max-w-lg mx-2 sm:mx-4">
          {navItems.map(({ id, label, shortLabel, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 min-w-0",
                mode === id
                  ? color === "blue"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : color === "purple"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : color === "emerald"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                    : "bg-rose-700 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{label}</span>
              <span className="sm:hidden truncate">{shortLabel}</span>
            </button>
          ))}
        </nav>

        {/* Right: User Session */}
        {session?.user ? (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all group"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={24}
                  height={24}
                  className="rounded-full border border-slate-600"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-[10px] font-black text-white">
                  {(session.user.name ?? "U")[0]}
                </div>
              )}
              <span className="hidden md:block text-xs font-semibold text-slate-300 max-w-[100px] truncate">
                {session.user.name?.split(" ")[0] ?? session.user.email}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-slate-900/95 border border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
