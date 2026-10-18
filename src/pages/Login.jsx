import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  KeyRound,
  CheckCircle2,
  Globe,
  QrCode,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useTranslation } from 'react-i18next';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangOpen(false);
  };

  // OAuth / social sign-in handlers (mock session + redirect)
  const handleOAuthLogin = (provider) => {
    localStorage.setItem('hualink_auth', 'active');
    localStorage.setItem('hualink_provider', provider);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  // Email Continue: validate email and sign the user in successfully
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Simulate successful sign-in and persist user session
    localStorage.setItem(
      'hualink_user',
      JSON.stringify({ name: 'Johnson', email: formData.email, isLoggedIn: true })
    );
    localStorage.setItem('hualink_auth', 'active');
    localStorage.setItem('token', 'mock-session-token');
    window.dispatchEvent(new Event('authChange'));

    if (onLoginSuccess) {
      onLoginSuccess({ email: formData.email });
    }

    navigate('/');
  };

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
                className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 bg-gray-50 rounded-full text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Globe size={14} className="text-gray-500" />
                <span className="font-bold">
                  {i18n.language === 'en' ? 'English' : i18n.language === 'sw' ? 'Kiswahili' : '中文'}
                </span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-lg py-2 z-50 rounded-lg">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={i18n.language === 'en' ? 'text-[#E50914] font-bold' : 'text-gray-600'}>English</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('sw')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={i18n.language === 'sw' ? 'text-[#E50914] font-bold' : 'text-gray-600'}>Kiswahili</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('zh')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={i18n.language === 'zh' ? 'text-[#E50914] font-bold' : 'text-gray-600'}>中文</span>
                  </button>
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
            alt="Business owner working in modern office"
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
            *Eligibility restrictions apply. Terms & Conditions apply.
          </div>
        </div>

        {/* Right Column - Social Logins & Form */}
        <div className="flex flex-col h-full min-h-[550px] p-8 md:p-12">
          {/* Header */}
          <h1 className="text-2xl font-black text-gray-900 mb-6">
            {t('auth.signInOrCreateAccount')}
          </h1>

          {/* Social Login Buttons */}
          <button
            onClick={() => {
              const email = formData.email || 'johnson@hualink.co.tz';
              localStorage.setItem(
                'hualink_user',
                JSON.stringify({ name: 'Johnson', email, isLoggedIn: true })
              );
              localStorage.setItem('hualink_auth', 'active');
              window.dispatchEvent(new Event('authChange'));
              navigate('/');
            }}
            className="w-full bg-white border border-gray-300 hover:border-gray-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 text-sm text-gray-800 shadow-sm hover:shadow transition-all cursor-pointer mb-3"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#EA4335"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#34A853"
                d="M12 23c4.3 0 8.01-2.47 9.82-6.16l-3.57-2.77c-.87 1.62-3.31 2.77-6.25 2.77-1.48 0-2.73-.4-3.71-1.06l3.57-2.77c.47 1.39 1.24 2.6 2.21 3.31zM12 4.26c1.77 0 3.45.43 4.93 1.18l3.66 2.84c.66-1.48 1.09-3.16 1.09-4.93C21.57 5.98 21.14 4.26 12 4.26z"
              />
            </svg>
            {t('auth.continueWithGoogle')}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="border-t border-gray-300" />
            <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#F5F5F5] px-4 text-xs font-bold text-slate-600">
              ─ OR ─
            </span>
          </div>

          {/* Auth Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#E50914] focus:outline-none border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E50914] hover:bg-[#C0040F] text-white font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
            >
              {loading ? 'Signing in...' : t('auth.continue')}
            </button>
          </form>

          {/* QR Code Sign-In Footer Link */}
          <div className="mt-8 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 cursor-pointer">
            <QrCode size={14} className="text-gray-700" />
            <span>{t('auth.signInWithQR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}