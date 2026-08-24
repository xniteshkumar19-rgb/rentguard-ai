'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Navigation,
  NavTab,
} from '@/components/Navigation';
import { LandingHero } from '@/components/LandingHero';
import { InspectionWorkflow } from '@/components/InspectionWorkflow';
import { InspectionHistoryView } from '@/components/InspectionHistoryView';
import { DepositReportView } from '@/components/DepositReportView';
import { ListingGeneratorView } from '@/components/ListingGeneratorView';
import { ReviewsView } from '@/components/ReviewsView';
import { AdminChurnDashboard } from '@/components/AdminChurnDashboard';
import { AuthGate } from '@/components/AuthGate';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy-loaded — never blocks initial page render, safe for SSR
const SpatialBackground = dynamic(
  () => import('@/components/SpatialBackground').then((m) => ({ default: m.SpatialBackground })),
  { ssr: false }
);

export default function RentGuardMasterPage() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [persona, setPersona] = useState<'tenant' | 'manager'>('tenant');
  const [authenticated, setAuthenticated] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // User Profile
  const userName = persona === 'tenant' ? 'Aditi Sharma' : 'Property Admin';
  const userEmail =
    persona === 'tenant'
      ? 'aditi.sharma@rentguard.ai'
      : 'admin@rentguard.ai';

  const handleTogglePersona = () => {
    setPersona((p) => (p === 'tenant' ? 'manager' : 'tenant'));
  };

  return (
    <div className="min-h-screen bg-[var(--rg-bg)] text-[var(--rg-ink)] relative selection:bg-[var(--rg-brass)] selection:text-black flex flex-col justify-between">
      {/* ── 3D Spatial Atmospheric Layer ── */}
      <SpatialBackground variant={activeTab} />

      {/* ── Ambient Vignette Background ── */}
      <div className="rg-vignette" />

      {/* ── Auth Gate Modal Overlay ── */}
      {(showAuthModal || !authenticated) && (
        <AuthGate
          onAuthenticated={() => {
            setAuthenticated(true);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <div className={cn('relative z-10 flex-1 flex flex-col', !authenticated && 'blur-sm pointer-events-none select-none')}>
        {/* ── Top Header & Tab Navigation ── */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          persona={persona}
          onTogglePersona={handleTogglePersona}
          userName={userName}
          userEmail={userEmail}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />

        {/* ── Main Tab Content Viewport ── */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && <LandingHero onNavigate={(tab) => setActiveTab(tab)} />}

          {activeTab === 'new_inspection' && <InspectionWorkflow />}

          {activeTab === 'history' && <InspectionHistoryView />}

          {activeTab === 'deposit_report' && <DepositReportView />}

          {activeTab === 'listing' && <ListingGeneratorView />}

          {activeTab === 'reviews' && (
            <ReviewsView
              userPersona={persona}
              currentUser={{ name: userName, email: userEmail }}
            />
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-[var(--rg-line)] pb-4">
                <span className="rg-mono text-[11px] px-2.5 py-1 border border-[var(--rg-rust-dim)] text-[var(--rg-rust)] bg-[rgba(193,85,61,0.12)] rounded-sm">
                  ADMIN &amp; ML TELEMETRY
                </span>
                <h2 className="rg-display text-2xl sm:text-3xl font-bold text-[var(--rg-ink)] mt-2">
                  Tenant Retention &amp; ML Churn Analytics
                </h2>
              </div>
              <AdminChurnDashboard />
            </div>
          )}
        </main>

        {/* ── Unified Footer ── */}
        <footer className="border-t border-[var(--rg-line)] bg-[#080a09] py-8 text-xs rg-mono text-[var(--rg-ink-faint)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--rg-brass)]" />
              <span className="font-bold text-[var(--rg-ink-dim)]">RentGuard AI Platform</span>
              <span>· Certified Room Handover &amp; Deposit Ledger</span>
            </div>

            <div className="flex items-center gap-6">
              <span>Model Tenancy Act Compliant</span>
              <span>Pan-India Jurisdiction</span>
              <a
                href="https://github.com/xniteshkumar19-rgb/rentguard-ai"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--rg-brass)] hover:underline flex items-center gap-1"
              >
                GitHub Repo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
