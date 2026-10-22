import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  ADMIN_PASSCODE,
  isAdminPasscodeUnlocked,
  unlockAdminPasscode,
  lockAdminPasscode,
} from './adminPasscode';

/**
 * Second gate for the admin dashboard.
 *
 * This is deliberately layered *on top of* the ADMIN role check rather than
 * replacing it: a visitor must already be signed in as an ADMIN (enforced by
 * ProtectedRoute) and then supply the admin passcode here. The passcode only
 * unlocks the UI for this browser session; it never grants the ADMIN role.
 */
export default function AdminPasscodeGate({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(isAdminPasscodeUnlocked);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!passcode.trim()) {
      setError(t('admin.gate.errorEmpty'));
      return;
    }

    if (passcode !== ADMIN_PASSCODE) {
      setError(t('admin.gate.errorIncorrect'));
      setPasscode('');
      return;
    }

    unlockAdminPasscode();
    setError('');
    setPasscode('');
    setUnlocked(true);
  };

  const handleLock = () => {
    lockAdminPasscode();
    setUnlocked(false);
    setPasscode('');
  };

  if (unlocked) {
    return (
      <>
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
            <ShieldCheck size={14} />
            {t('admin.gate.unlocked')}
          </span>
          <button
            type="button"
            onClick={handleLock}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {t('admin.gate.lock')}
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-800/70 border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 mb-4 shadow-[0_0_24px_-4px] shadow-orange-500/40">
            <Lock size={24} strokeWidth={2.2} />
          </span>
          <h1 className="text-lg font-black text-white tracking-tight">{t('admin.gate.title')}</h1>
          <p className="text-xs text-slate-400 font-medium mt-1.5">
            {t('admin.gate.subtitle')}
          </p>
          {user?.email ? (
            <p className="text-[11px] font-bold text-slate-500 mt-2">
              {t('admin.gate.signedInAs', { name: user.name || user.email })}
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-passcode" className="block text-[11px] font-bold text-slate-400 mb-1.5">
              {t('admin.gate.passcodeLabel')}
            </label>
            <div className="relative">
              <input
                id="admin-passcode"
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="off"
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPasscode((value) => !value)}
                aria-label={showPasscode ? t('admin.gate.hidePasscode') : t('admin.gate.showPasscode')}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error ? (
              <p role="alert" className="text-[11px] font-bold text-red-400 mt-2">
                {error}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition-colors cursor-pointer shadow-md shadow-orange-500/20"
          >
            {t('admin.gate.unlock')}
          </button>
        </form>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-700/60">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            {t('admin.gate.backToSite')}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            {t('admin.gate.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
