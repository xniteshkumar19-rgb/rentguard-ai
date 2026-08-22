'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CircleCheckBig } from 'lucide-react';
import AuthGate from '@/components/AuthGate';
import BeforeAfterInspector from '@/components/BeforeAfterInspector';
import RoomLedger from '@/components/RoomLedger';
import ChurnTelemetry from '@/components/ChurnTelemetry';

function CountUp({ to, prefix = '', suffix = '', duration = 1400 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [to, duration]);

  return (
    <span>
      {prefix}
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <main className="min-h-screen relative">
      <div className="rg-vignette" />

      {!authenticated && <AuthGate onAuthenticated={() => setAuthenticated(true)} />}

      <div className={authenticated ? 'relative z-[1]' : 'relative z-[1] pointer-events-none blur-sm select-none'}>
        {/* Top bar */}
        <header className="border-b border-[var(--rg-line-strong)] px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-[var(--rg-brass)]" />
            <span className="rg-display text-lg">RentGuard AI</span>
          </div>
          <span className="rg-mono text-[10px] text-[var(--rg-ink-dim)] text-right">
            DEMO CASE · RG-26-0417 · CHANDIGARH
          </span>
        </header>

        {/* Hero */}
        <section className="px-4 sm:px-6 py-10 sm:py-12 border-b border-[var(--rg-line)] relative overflow-hidden">
          <div className="max-w-5xl relative">
            <span className="rg-mono text-[11px] text-[var(--rg-ink-dim)] rg-animate-in">
              MOVE-OUT INSPECTION DOSSIER · SAMPLE DATA
            </span>

            <div className="flex items-start gap-5">
              <h1 className="rg-display text-4xl sm:text-6xl mt-2 leading-[1.02] rg-animate-in rg-delay-1">
                Every scuff, dated.<br />Every rupee, accounted for.
              </h1>

              {/* Signature moment: forensic stamp */}
              <div className="hidden sm:flex shrink-0 mt-3 items-center justify-center w-24 h-24 rounded-full border-[3px] border-[var(--rg-rust)] text-[var(--rg-rust)] rg-mono text-[11px] tracking-widest text-center leading-tight -rotate-[8deg] shadow-[0_0_0_3px_var(--rg-bg)]">
                VERIFIED<br />BY AI
              </div>
            </div>

            <p className="text-[var(--rg-ink-dim)] mt-4 max-w-xl text-sm leading-relaxed rg-animate-in rg-delay-2">
              This demo workspace cross-references move-in and move-out photography against
              per-room condition baselines, produces a defensible INR valuation,
              and flags tenants drifting toward churn before the lease does.
            </p>

            {/* Metrics strip */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-8 rg-animate-in rg-delay-3">
              <div>
                <div className="rg-mono text-2xl text-[var(--rg-brass)]">
                  <CountUp to={2417000} prefix="₹" />
                </div>
                <div className="rg-mono text-[10px] text-[var(--rg-ink-faint)] mt-1">DISPUTES RESOLVED, TO DATE</div>
              </div>
              <div>
                <div className="rg-mono text-2xl text-[var(--rg-teal)]">
                  <CountUp to={1204} />
                </div>
                <div className="rg-mono text-[10px] text-[var(--rg-ink-faint)] mt-1">INSPECTIONS LOGGED</div>
              </div>
              <div>
                <div className="rg-mono text-2xl text-[var(--rg-ink)]">
                  <CountUp to={94} suffix="%" />
                </div>
                <div className="rg-mono text-[10px] text-[var(--rg-ink-faint)] mt-1">AI VALUATION ACCURACY</div>
              </div>
            </div>
            <ol aria-label="Inspection workflow" className="mt-8 grid gap-px sm:grid-cols-4 border border-[var(--rg-line-strong)] bg-[var(--rg-line-strong)] max-w-4xl">
              {[
                ['01', 'Capture', 'Attach dated evidence'],
                ['02', 'Compare', 'Review condition delta'],
                ['03', 'Value', 'Set INR range'],
                ['04', 'Audit', 'Export case finding'],
              ].map(([step, title, detail], index) => <li key={title} className="bg-[var(--rg-surface)] px-3 py-3 flex gap-3"><span className="rg-mono text-[10px] text-[var(--rg-brass)]">{step}</span><div><strong className="rg-mono text-[11px] uppercase">{title}</strong><span className="block text-xs text-[var(--rg-ink-faint)] mt-0.5">{detail}</span></div>{index < 3 && <CircleCheckBig className="hidden lg:block ml-auto text-[var(--rg-teal)]" size={15} aria-hidden="true" />}</li>)}
            </ol>
          </div>
        </section>

        {/* Modules */}
        <section className="px-4 sm:px-6 py-10 border-b border-[var(--rg-line)] rg-animate-in">
          <BeforeAfterInspector />
        </section>

        <section className="px-4 sm:px-6 py-10 border-b border-[var(--rg-line)] rg-animate-in">
          <RoomLedger />
        </section>

        <section className="px-4 sm:px-6 py-10 rg-animate-in">
          <ChurnTelemetry />
        </section>

        <footer className="px-4 sm:px-6 py-6 border-t border-[var(--rg-line)] rg-mono text-[10px] text-[var(--rg-ink-faint)] text-center">
          RENTGUARD AI · DEMONSTRATION WORKSPACE · DOCUMENTARY AID, NOT LEGAL ADVICE
        </footer>
      </div>
    </main>
  );
}
