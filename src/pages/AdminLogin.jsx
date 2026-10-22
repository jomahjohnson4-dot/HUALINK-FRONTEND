import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL, isAdminEmail } from '../config/adminAccess';
import { LANGUAGES } from '../hooks/useLanguage';

/**
 * Secure administration entry (`/admin/login`).
 *
 * This route is deliberately NOT linked from any public navigation element.
 * It is reachable through the discreet trigger on the standard sign-in page
 * and through the `Ctrl + Shift + A` keyboard shortcut, and it only ever
 * accepts the designated master password — no public "LOGIN AS ADMIN" button
 * exists anywhere in the application.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  // The admin surface is a session-only surface: an already authenticated
  // administrator is sent straight to the console.
  useEffect(() => {
    document.title = `${t('auth.admin.title')} — HUALINK`;
  }, [t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('auth.admin.incomplete'));
      return;
    }

    if (!isAdminEmail(email)) {
      setError(t('auth.admin.invalid'));
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin', { replace: true });
    } catch {
      setError(t('auth.admin.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800/80 px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="cursor-pointer" />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((open) => !open)}
            aria-label={t('common.language')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 bg-slate-900 rounded-full text-[11px] font-bold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-slate-400" />
            <span>
              {LANGUAGES.find((lang) => lang.code === i18n.language)?.label || 'English'}
            </span>
          </button>

          {isLangOpen ? (
            <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-50 rounded-lg">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors ${
                    i18n.language === lang.code ? 'text-brand-red' : 'text-slate-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-7">
            <span className="h-14 w-14 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-4">
              <Lock size={24} strokeWidth={2.2} />
            </span>
            <h1 className="text-lg font-black tracking-tight text-white">{t('auth.admin.title')}</h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5 max-w-xs">
              {t('auth.admin.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider"
              >
                {t('auth.admin.email')}
              </label>
              <div className="relative">
                <ShieldCheck
                  size={15}
                  className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none"
                />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  spellCheck={false}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-master-password"
                className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider"
              >
                {t('auth.admin.password')}
              </label>
              <div className="relative">
                <KeyRound
                  size={15}
                  className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none"
                />
                <input
                  id="admin-master-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
                  placeholder={t('auth.admin.passwordPlaceholder')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-red transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? t('auth.admin.hidePassword') : t('auth.admin.showPassword')}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              disabled={loading}
              className="w-full bg-brand-red hover:bg-red-700 text-white font-extrabold text-sm py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-950/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              <span>{loading ? t('auth.admin.submitting') : t('auth.admin.submit')}</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-800">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              {t('auth.admin.backToLogin')}
            </Link>
            <span className="text-[10px] font-bold text-slate-600">{t('auth.admin.shortcut')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
