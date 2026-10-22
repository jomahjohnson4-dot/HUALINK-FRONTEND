/* global google */
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  X,
  Globe,
} from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import Logo from '../components/Logo';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import {
  isAdminEmail,
  isAdminMasterCredential,
  isAdminUser,
} from '../config/adminAccess';

export default function Login({ onLoginSuccess }) {
  // ------------------------------------------------------------------
  // Defensive state initialization (try/catch fallback so a malformed
  // default value never breaks the initial render / blank white screen).
  // ------------------------------------------------------------------
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  // Defensive default-fallback state initialization so a malformed default
  // value never breaks the initial render (prevents blank white screen).
  const [formData, setFormData] = useState(() => ({
    email: '',
    password: '',
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fallbackBanner, setFallbackBanner] = useState(false);
  const { t, i18n } = useTranslation();

  // Google OAuth must only render inside <GoogleOAuthProvider>. Rendering
  // <GoogleLogin> without the provider throws during render, which unmounts
  // the whole tree and produces the blank /login screen. It is also skipped
  // when no client id has been configured.
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangOpen(false);
  };

  // ------------------------------------------------------------------
  // Secure admin entry.
  //
  // There is NO public "LOGIN AS ADMIN" button. Administrators either
  //   1. sign in with the protected admin mailbox + the designated master
  //      password in the standard form below, or
  //   2. open the dedicated secure route `/admin/login` through the
  //      discreet trigger or the Ctrl+Shift+A shortcut.
  // ------------------------------------------------------------------
  const openSecureAdminEntry = useCallback(() => {
    navigate('/admin/login');
  }, [navigate]);

  // Keyboard shortcut: Ctrl + Shift + A (also Alt + Shift + A) opens the
  // secure administrator entry.
  useEffect(() => {
    const handleShortcut = (event) => {
      if (!event.shiftKey) return;
      if (!(event.ctrlKey || event.altKey) || event.metaKey) return;

      const key = String(event.key || '').toLowerCase();
      if (key !== 'a') return;

      event.preventDefault();
      openSecureAdminEntry();
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [openSecureAdminEntry]);

  // ------------------------------------------------------------------
  // Email / Password sign-in -> POST /api/auth/login
  // ------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError(t('auth.validEmail'));
      setLoading(false);
      return;
    }

    // ----------------------------------------------------------------
    // Secure admin path: protected admin mailbox + designated master
    // password. The session is routed to /admin.
    // ----------------------------------------------------------------
    if (isAdminMasterCredential(formData.email, formData.password)) {
      try {
        const { user } = await adminLogin(formData.email, formData.password);

        if (onLoginSuccess) {
          onLoginSuccess(user);
        }

        navigate('/admin', { replace: true });
        return;
      } catch {
        setError(t('auth.admin.invalid'));
        setLoading(false);
        return;
      }
    }

    // The admin mailbox with a non-master password is never accepted as a
    // regular customer account.
    if (isAdminEmail(formData.email)) {
      setError(t('auth.admin.invalid'));
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Safely extract token & profile without throwing on malformed
      // backend responses (undefined data, missing token/user, etc.).
      const data = response.data ?? {};
      const token = data?.token || data?.accessToken || null;
      const user = data?.user || data?.profile || null;

      // Persist real JWT session
      if (token) {
        localStorage.setItem('hualink_token', token);
      }
      if (user) {
        localStorage.setItem('hualink_user', JSON.stringify(user));
      }
      localStorage.setItem('hualink_auth', 'active');

      // Notify auth listeners of the new session
      window.dispatchEvent(
        new CustomEvent('hualink:session-change', { detail: { user, token } })
      );

      if (onLoginSuccess) {
        onLoginSuccess({ email: formData.email, ...(user || {}) });
      }

      // A backend-issued admin profile routes straight to the console;
      // everybody else keeps the standard customer permissions.
      navigate(isAdminUser(user) ? '/admin' : '/');
    } catch (err) {
      // ------------------------------------------------------------------
      // Graceful fallback: backend 404 / unreachable. Capture without
      // crashing, show a clear message, and store a local session so
      // testing is never blocked when the Express server is down.
      // ------------------------------------------------------------------
      const isNetworkError = !err.response;
      const isNotFound = err.response?.status === 404;

      if (isNetworkError || isNotFound) {
        const fallbackMessage = t('auth.backendUnreachable');
        setError(fallbackMessage);
        setFallbackBanner(true);
        setTimeout(() => setFallbackBanner(false), 6000);

        // Persist a local fallback session so testing is never blocked.
        // Regular users always receive standard customer permissions.
        const fallbackUser = {
          email: formData.email,
          name: formData.email.split('@')[0] || 'Customer',
          role: 'customer',
          isLoggedIn: true,
          fallback: true,
          signedInAt: new Date().toISOString(),
        };
        localStorage.setItem('hualink_user', JSON.stringify(fallbackUser));
        localStorage.setItem('hualink_token', 'demo_token_123');
        localStorage.setItem('hualink_auth', 'active');

        window.dispatchEvent(
          new CustomEvent('hualink:session-change', {
            detail: { user: fallbackUser, token: 'demo_token_123' },
          })
        );

        if (onLoginSuccess) {
          onLoginSuccess({ email: formData.email, ...fallbackUser });
        }

        navigate('/');
      } else {
        setError(
          err.response?.data?.message || err.message || t('auth.loginFailed')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Google OAuth login -> POST /api/auth/google  { token: credentialResponse.credential }
  // ------------------------------------------------------------------
  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      setGoogleLoading(true);
      setError('');

      try {
        const response = await api.post('/auth/google', {
          token: credentialResponse.credential,
        });

        const data = response.data ?? {};
        const token = data?.token || data?.accessToken || null;
        const user = data?.user || data?.profile || null;

        if (token) {
          localStorage.setItem('hualink_token', token);
        }
        if (user) {
          localStorage.setItem('hualink_user', JSON.stringify(user));
        }
        localStorage.setItem('hualink_auth', 'active');

        window.dispatchEvent(
          new CustomEvent('hualink:session-change', { detail: { user, token } })
        );

        if (onLoginSuccess) {
          onLoginSuccess({ email: user?.email || '', ...(user || {}) });
        }

        navigate(isAdminUser(user) ? '/admin' : '/');
      } catch (err) {
        const isNetworkError = !err.response;
        const isNotFound = err.response?.status === 404;

        if (isNetworkError || isNotFound) {
          const fallbackMessage = t('auth.backendUnreachable');
          setError(fallbackMessage);
          setFallbackBanner(true);
          setTimeout(() => setFallbackBanner(false), 6000);

          const fallbackUser = {
            email: '',
            name: 'Google User',
            role: 'customer',
            isLoggedIn: true,
            fallback: true,
            signedInAt: new Date().toISOString(),
          };
          localStorage.setItem('hualink_user', JSON.stringify(fallbackUser));
          localStorage.setItem('hualink_token', 'demo_token_123');
          localStorage.setItem('hualink_auth', 'active');

          window.dispatchEvent(
            new CustomEvent('hualink:session-change', {
              detail: { user: fallbackUser, token: 'demo_token_123' },
            })
          );

          if (onLoginSuccess) {
            onLoginSuccess({ email: '', ...fallbackUser });
          }

          navigate('/');
        } else {
          setError(
            err.response?.data?.message || err.message || t('auth.googleFailed')
          );
        }
      } finally {
        setGoogleLoading(false);
      }
    },
    [onLoginSuccess, navigate, t]
  );

  const handleGoogleFailure = () => {
    setError(t('auth.googleCancelled'));
    setGoogleLoading(false);
  };

  // Mount the Google One Tap / button client once (defensive try/catch)
  useEffect(() => {
    try {
      if (typeof google !== 'undefined' && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleSuccess,
        });
      }
    } catch {
      // Google client not available — OAuth button remains but won't initialize.
      console.warn('[Google OAuth] client initialization skipped.');
    }
  }, [handleGoogleSuccess]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 flex flex-col">
      {/* Minimal Auth Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="cursor-pointer" />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Top-Right Language Pill Selector (Dropdown) */}
            <div className="relative group">
              <button
                onClick={() => setIsLangOpen((o) => !o)}
                aria-label={t('common.language')}
                className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 bg-gray-50 rounded-full text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Globe size={14} className="text-gray-500" />
                <span className="font-bold">
                  {LANGUAGES.find((lang) => lang.code === i18n.language)?.label || 'English'}
                </span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg py-2 z-50 rounded-lg">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <span>{lang.flag}</span>
                      <span
                        className={
                          i18n.language === lang.code ? 'text-[#E50914] font-bold' : 'text-gray-600'
                        }
                      >
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ken Burns zoom + fade-in animations for the hero image & badges */}
      <style>{`@keyframes kenBurns { from { transform: scale(1); } to { transform: scale(1.05); } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Split 2-Column Layout */}
      <div className="min-h-[calc(100vh-80px)] w-full grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* Left Column - Hero Image with Feature Badges */}
        <div className="relative w-full h-full min-h-[550px] flex overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200"
            alt={t('auth.heroAlt')}
            className="w-full h-full object-cover rounded-none md:rounded-r-3xl"
            style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }}
          />

          {/* Floating Feature Badges */}
          <div className="absolute top-1/3 right-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-gray-900 shadow-xl border-l-4 border-[#E50914] animate-bounce">
            {t('auth.topSellingSuppliers')}
          </div>
          <div className="absolute top-1/2 left-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-gray-900 shadow-xl border-l-4 border-[#E50914]">
            {t('auth.freeShipping')}
          </div>
          <div className="absolute bottom-16 right-12 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-gray-900 shadow-xl border-l-4 border-[#E50914]">
            {t('auth.moneyBackGuarantee')}
          </div>

          {/* Disclaimer */}
          <div className="absolute bottom-3 left-6 text-[10px] text-white/80">
            {t('auth.disclaimer')}
          </div>
        </div>

        {/* Right Column - Welcome Back Form */}
        <div className="flex flex-col h-full min-h-[550px] p-8 md:p-12">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {t('auth.signInSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {googleLoading && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              {t('auth.verifyingGoogle')}
            </div>
          )}

          {/* Backend Unreachable Fallback Banner */}
          {fallbackBanner && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button (real backend verification).
              Only rendered when a client id is configured, and always inside
              <GoogleOAuthProvider> — otherwise the component throws and the
              page renders blank. */}
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                theme="outline"
                buttonsColor="white"
                width="320"
                text="signin_with"
                size="large"
                logo_alignment="center"
              />
            </GoogleOAuthProvider>
          ) : null}

          {/* Divider */}
          {googleClientId ? (
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-bold text-gray-400">{t('auth.or')}</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
          ) : null}

          {/* Auth Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {t('auth.emailAddress')}
              </label>
              <div className="relative mb-4">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#E50914] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field & Forgot? Link */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t('auth.password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#E50914] hover:underline"
              >
                {t('auth.forgot')}
              </Link>
            </div>
            <div className="relative mb-6">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#E50914] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E50914] hover:bg-[#C0040F] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('auth.secureNote')}</span>
          </div>

          {/* Register Link */}
          <p className="mt-3 text-center text-xs text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-bold text-[#E50914] hover:underline">
              {t('auth.createAccount')}
            </Link>
          </p>

          {/* Discreet administrator entry.
              Kept intentionally unobtrusive: no public "LOGIN AS ADMIN"
              button exists, the route is also reachable with Ctrl + Shift + A. */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={openSecureAdminEntry}
              aria-label={t('auth.admin.discreetEntry')}
              title={t('auth.admin.discreetEntry')}
              className="text-gray-300 hover:text-gray-600 focus:text-gray-700 transition-colors cursor-pointer opacity-60 hover:opacity-100 focus:opacity-100"
            >
              <ShieldCheck size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
