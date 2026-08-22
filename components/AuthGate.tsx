'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';

export interface AuthGateProps { onAuthenticated: () => void; onClose?: () => void; }

function GoogleLogo({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" /><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" /><path fill="#FBBC05" d="M11.69 28.18A11.96 11.96 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" /><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 5.58-9.07 12.31-9.07z" /></svg>;
}

export function AuthGate({ onAuthenticated, onClose }: AuthGateProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setIsGoogleLoading(true); setNotice(null);
    try { await signIn('google', { redirectTo: '/' }); }
    catch { setNotice('Google sign-in could not start. Check the Google OAuth settings in .env.local.'); setIsGoogleLoading(false); }
  }
  function handleDemoAccess() { setDemoLoading(true); window.setTimeout(() => { setDemoLoading(false); onAuthenticated(); }, 400); }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-labelledby="access-title">
    <div className="relative w-full max-w-sm bg-[var(--rg-surface)] border border-[var(--rg-line-strong)]">
      {onClose && <button onClick={onClose} aria-label="Close access dialog" className="absolute top-3 right-3 text-[var(--rg-ink-faint)] hover:text-[var(--rg-ink)]"><X size={16} /></button>}
      <div className="px-6 pt-7 pb-2 text-center"><div className="inline-flex items-center justify-center w-11 h-11 border border-[var(--rg-brass-dim)] bg-[rgba(201,154,75,0.12)] mb-3"><ShieldCheck size={20} className="text-[var(--rg-brass)]" /></div><h2 id="access-title" className="rg-display text-2xl text-[var(--rg-ink)]">RentGuard AI</h2><p className="rg-mono text-[11px] text-[var(--rg-ink-dim)] mt-1 tracking-wider">AUTHORIZED ACCESS ONLY</p></div>
      <div className="px-6 pb-6 pt-4 flex flex-col gap-2.5"><button onClick={handleGoogleLogin} disabled={isGoogleLoading} className="flex items-center justify-center gap-2.5 py-2.5 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors rounded-sm disabled:opacity-70"><GoogleLogo size={16} />{isGoogleLoading ? <><Loader2 size={15} className="animate-spin" />Redirecting to Google…</> : 'Continue with Google'}</button><p className="text-center text-[11px] leading-relaxed text-[var(--rg-ink-faint)]">Google opens its secure account chooser. RentGuard never receives your Google password.</p><div className="flex items-center gap-3 my-1"><div className="flex-1 h-px bg-[var(--rg-line-strong)]" /><span className="rg-mono text-[10px] text-[var(--rg-ink-faint)]">OR</span><div className="flex-1 h-px bg-[var(--rg-line-strong)]" /></div><button onClick={handleDemoAccess} disabled={demoLoading} className="flex items-center justify-center gap-2 py-2.5 border border-[var(--rg-teal-dim)] text-[var(--rg-teal)] text-sm hover:bg-[rgba(75,156,147,0.1)] transition-colors disabled:opacity-60"><KeyRound size={15} />{demoLoading ? 'Loading demo…' : 'Continue with instant admin demo'}</button>{notice && <p role="alert" className="text-xs text-[var(--rg-rust)] text-center">{notice}</p>}<p className="rg-mono text-[10px] text-[var(--rg-ink-faint)] text-center mt-2">Demo access uses seeded, non-production data.</p></div>
    </div>
  </div>;
}
export default AuthGate;
