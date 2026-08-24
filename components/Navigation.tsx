'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  ScanLine,
  History,
  FileCheck2,
  Home,
  BarChart3,
  User,
  Sparkles,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building2,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab =
  | 'dashboard'
  | 'new_inspection'
  | 'history'
  | 'deposit_report'
  | 'listing'
  | 'reviews'
  | 'admin';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  persona: 'tenant' | 'manager';
  onTogglePersona: () => void;
  userName?: string;
  userEmail?: string;
  onOpenAuthModal?: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new_inspection', label: 'New Inspection', icon: ScanLine, badge: 'AI' },
  { id: 'history', label: 'Inspection History', icon: History },
  { id: 'deposit_report', label: 'Deposit Report', icon: FileCheck2, badge: '₹45.5k' },
  { id: 'listing', label: 'Property Listings', icon: Home },
  { id: 'reviews', label: 'Hotel & PG Reviews', icon: Star, badge: 'New' },
  { id: 'admin', label: 'Admin & ML Churn', icon: BarChart3, badge: 'ML-15' },
];

export function Navigation({
  activeTab,
  onSelectTab,
  persona,
  onTogglePersona,
  userName = 'Aditi Sharma',
  userEmail = 'aditi.sharma@rentguard.ai',
  onOpenAuthModal,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isManager = persona === 'manager';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--rg-line-strong)] bg-[#0b0d0c]/90 backdrop-blur-xl rg-glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-[var(--rg-surface-raised)] border border-[var(--rg-brass-dim)] flex items-center justify-center shadow-[0_0_15px_rgba(201,154,75,0.15)]">
              <ShieldCheck className="w-5 h-5 text-[var(--rg-brass)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rg-display text-xl font-bold tracking-wider text-[var(--rg-ink)]">
                  RentGuard <span className="text-[var(--rg-brass)]">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] rg-mono font-bold uppercase tracking-widest bg-[rgba(75,156,147,0.12)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)] rounded-sm">
                  v3.2 PRO
                </span>
              </div>
              <p className="hidden md:block text-[10px] rg-mono text-[var(--rg-ink-faint)] -mt-0.5">
                SMART HANDOVER &amp; DEPOSIT LEDGER
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rg-mono transition-all rounded-md cursor-pointer',
                    isActive
                      ? 'text-[var(--rg-brass)] bg-[var(--rg-surface-raised)] border border-[var(--rg-brass-dim)] shadow-[0_0_12px_rgba(201,154,75,0.12)]'
                      : 'text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] hover:bg-[var(--rg-surface)] border border-transparent'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-[var(--rg-brass)]' : 'text-[var(--rg-ink-dim)]')} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.2 rounded font-bold',
                        isActive
                          ? 'bg-[var(--rg-brass)] text-black'
                          : 'bg-[var(--rg-surface-raised)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--rg-brass)] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Area: Persona Switcher & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Persona Switcher Toggle */}
            <button
              onClick={onTogglePersona}
              title="Toggle between Tenant view and Property Manager view"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rg-mono rounded border transition-all cursor-pointer',
                isManager
                  ? 'border-[var(--rg-brass-dim)] text-[var(--rg-brass)] bg-[rgba(201,154,75,0.1)]'
                  : 'border-[var(--rg-teal-dim)] text-[var(--rg-teal)] bg-[rgba(75,156,147,0.1)]'
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isManager ? 'Manager View' : 'Tenant View'}</span>
            </button>

            {/* Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-[var(--rg-surface)] border border-[var(--rg-line-strong)] hover:border-[var(--rg-brass-dim)] rounded-lg transition-all text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--rg-teal)] text-white font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(75,156,147,0.4)]">
                  {userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="hidden xl:block">
                  <div className="text-xs font-semibold text-[var(--rg-ink)] leading-tight">{userName}</div>
                  <div className="text-[10px] rg-mono text-[var(--rg-ink-faint)] leading-tight">{userEmail}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--rg-ink-faint)]" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--rg-surface-raised)] border border-[var(--rg-line-strong)] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[var(--rg-line)]">
                    <p className="text-xs font-bold text-[var(--rg-ink)]">{userName}</p>
                    <p className="text-[11px] rg-mono text-[var(--rg-ink-dim)] truncate">{userEmail}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--rg-teal)] rg-mono">
                      <CheckCircle2 className="w-3 h-3" /> Active Case #2026-0417
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSelectTab('admin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] hover:bg-[var(--rg-surface)] rounded-md transition-colors text-left cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[var(--rg-brass)]" />
                      <span>Admin Analytics</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--rg-rust)] hover:bg-[rgba(193,85,61,0.1)] rounded-md transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Account / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 text-[var(--rg-ink-dim)] hover:text-[var(--rg-ink)] bg-[var(--rg-surface)] border border-[var(--rg-line-strong)] rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--rg-line-strong)] bg-[#0b0d0c] px-4 pt-3 pb-5 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold rg-mono text-left cursor-pointer transition-all',
                  isActive
                    ? 'bg-[var(--rg-surface-raised)] text-[var(--rg-brass)] border border-[var(--rg-brass-dim)]'
                    : 'text-[var(--rg-ink-dim)] hover:bg-[var(--rg-surface)] border border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-[var(--rg-brass)]' : 'text-[var(--rg-ink-dim)]')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--rg-surface)] text-[var(--rg-teal)] border border-[var(--rg-teal-dim)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-[var(--rg-line)] flex items-center justify-between">
            <button
              onClick={() => {
                onTogglePersona();
                setMobileMenuOpen(false);
              }}
              className="text-xs rg-mono text-[var(--rg-teal)] flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Switch to {isManager ? 'Tenant View' : 'Manager View'}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="text-xs rg-mono text-[var(--rg-rust)] flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch User</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
