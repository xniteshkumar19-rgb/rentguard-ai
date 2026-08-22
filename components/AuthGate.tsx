'use client';

import { useState } from 'react';
import { ShieldCheck, X, KeyRound, ArrowLeft, UserPlus, Loader2 } from 'lucide-react';

export interface AuthGateProps {
  onAuthenticated: () => void;
  onClose?: () => void;
}

type Step = 'root' | 'chooser' | 'other-account' | 'verifying';

interface GoogleAccount {
  name: string;
  email: string;
  initials: string;
  color: string;
}

const ACCOUNTS: GoogleAccount[] = [
  { name: 'Aditi Sharma', email: 'aditi.sharma@rentguard.ai', initials: 'AS', color: '#4b9c93' },
  { name: 'Property Admin', email: 'admin@rentguard.ai', initials: 'PA', color: '#c99a4b' },
];

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18A11.96 11.96 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function AuthGate({ onAuthenticated, onClose }: AuthGateProps) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<Step>('root');
  const [demoLoading, setDemoLoading] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  function selectAccount(account: GoogleAccount) {
    setSelectedAccount(account);
    setStep('verifying');
    setTimeout(() => {
      setOpen(false);
      onAuthenticated();
    }, 1000);
  }

  function submitOtherAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!otherEmail.trim()) return;
    selectAccount({ name: otherEmail.split('@')[0], email: otherEmail, initials: 'U', color: '#8b9089' });
  }

  function handleDemoAccess() {
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
      setOpen(false);
      onAuthenticated();
    }, 400);
  }

  if (!open) return null;

  // --- Google account chooser (light theme, matches real Google styling) ---
  if (step === 'chooser' || step === 'other-account' || step === 'verifying') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden font-sans">
          {step !== 'verifying' && (
            <button
              onClick={() => setStep(step === 'other-account' ? 'chooser' : 'root')}
              aria-label="Back"
              className="absolute top-5 left-5 text-gray-500 hover:text-gray-800 z-10 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 z-10 cursor-pointer"
          >
            <X size={18} />
          </button>

          {step === 'verifying' && selectedAccount ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-medium text-lg mb-5"
                style={{ backgroundColor: selectedAccount.color }}
              >
                {selectedAccount.initials}
              </div>
              <Loader2 size={20} className="animate-spin text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 font-medium">Signing in as {selectedAccount.name}…</p>
            </div>
          ) : step === 'chooser' ? (
            <div className="pt-10 pb-6">
              <div className="flex flex-col items-center px-8 mb-2">
                <GoogleLogo size={22} />
                <h2 className="text-xl text-gray-800 mt-4 font-normal">Choose an account</h2>
                <p className="text-sm text-gray-500 mt-1 text-center">to continue to RentGuard AI</p>
              </div>

              <div className="mt-4 border-t border-gray-100">
                {ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => selectAccount(acc)}
                    className="w-full flex items-center gap-3.5 px-8 py-3.5 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800 truncate font-medium">{acc.name}</div>
                      <div className="text-xs text-gray-500 truncate">{acc.email}</div>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => setStep('other-account')}
                  className="w-full flex items-center gap-3.5 px-8 py-3.5 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 shrink-0">
                    <UserPlus size={16} className="text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-700">Use another account</span>
                </button>
              </div>

              <p className="px-8 pt-5 text-[11px] leading-relaxed text-gray-400 border-t border-gray-100 mt-2">
                To continue, Google will share your name, email address, and
                profile picture with RentGuard AI.
              </p>
            </div>
          ) : (
            <form onSubmit={submitOtherAccount} className="pt-10 pb-8 px-8">
              <div className="flex flex-col items-center mb-6">
                <GoogleLogo size={22} />
                <h2 className="text-xl text-gray-800 mt-4 font-normal">Sign in</h2>
                <p className="text-sm text-gray-500 mt-1 text-center">to continue to RentGuard AI</p>
              </div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Email or phone</label>
              <input
                autoFocus
                type="email"
                value={otherEmail}
                onChange={(e) => setOtherEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
              />
              <div className="flex items-center justify-end mt-7">
                <button
                  type="submit"
                  className="bg-[#4285F4] hover:bg-[#3b78e0] text-white text-sm font-medium px-6 py-2 rounded-md transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- RentGuard branded entry modal ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm bg-[var(--rg-surface)] border border-[var(--rg-line-strong)]">
        {onClose && (
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-3 right-3 text-[var(--rg-ink-faint)] hover:text-[var(--rg-ink)] cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        <div className="px-6 pt-7 pb-2 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 border border-[var(--rg-brass-dim)] bg-[rgba(201,154,75,0.12)] mb-3">
            <ShieldCheck size={20} className="text-[var(--rg-brass)]" />
          </div>
          <h2 className="rg-display text-2xl text-[var(--rg-ink)]">RentGuard AI</h2>
          <p className="rg-mono text-[11px] text-[var(--rg-ink-dim)] mt-1 tracking-wider">
            AUTHORIZED ACCESS ONLY
          </p>
        </div>

        <div className="px-6 pb-6 pt-4 flex flex-col gap-2.5">
          <button
            onClick={() => setStep('chooser')}
            className="flex items-center justify-center gap-2.5 py-2.5 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors rounded-sm cursor-pointer"
          >
            <GoogleLogo size={16} />
            Sign in with Google Workspace
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[var(--rg-line-strong)]" />
            <span className="rg-mono text-[10px] text-[var(--rg-ink-faint)]">OR</span>
            <div className="flex-1 h-px bg-[var(--rg-line-strong)]" />
          </div>

          <button
            onClick={handleDemoAccess}
            disabled={demoLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-[var(--rg-teal-dim)] text-[var(--rg-teal)] text-sm hover:bg-[rgba(75,156,147,0.1)] transition-colors disabled:opacity-60 cursor-pointer"
          >
            <KeyRound size={15} />
            {demoLoading ? 'Loading demo…' : 'Continue with instant admin demo'}
          </button>

          <p className="rg-mono text-[10px] text-[var(--rg-ink-faint)] text-center mt-2">
            Demo access uses seeded, non-production data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthGate;
