import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

export default function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    region: 'Dar es Salaam',
    password: '',
    companyName: '',
  });
  const [fallbackBanner, setFallbackBanner] = useState(false);

  const regions = [
    'Dar es Salaam',
    'Mbeya',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Tanga',
    'Morogoro',
    'Zanzibar',
    'Other Region',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (accountType === 'wholesale' && !formData.companyName.trim()) {
      setError('Company name is required for Wholesale Partner accounts.');
      return;
    }

    // Map frontend accountType to backend Role enum values
    const roleMap = {
      buyer: 'CUSTOMER',
      wholesale: 'BUSINESS',
    };

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      region: formData.region,
      accountType: roleMap[accountType] || 'CUSTOMER',
      password: formData.password,
      companyName: accountType === 'wholesale' ? formData.companyName : '',
    };

    try {
      setLoading(true);
      const response = await api.post('/auth/register', payload);

      const { token, user } = response.data;

      // Persist real JWT session (replaces previous mock localStorage-only flow)
      localStorage.setItem('hualink_token', token);
      localStorage.setItem('hualink_user', JSON.stringify(user));

      // Notify auth listeners of the new session
      window.dispatchEvent(
        new CustomEvent('hualink:session-change', { detail: { user, token } })
      );

      if (onRegisterSuccess) {
        onRegisterSuccess(user);
      }

      // Auto login & redirect to landing marketplace
      navigate('/');
    } catch (err) {
      const isNetworkError = !err.response;
      const isNotFound = err.response?.status === 404;

      if (isNetworkError || isNotFound) {
        setError('Backend API unreachable on port 5000. Saving session locally...');
        setFallbackBanner(true);
        setTimeout(() => setFallbackBanner(false), 6000);

        // Persist local demo session so flow is never blocked during backend restarts
        const fallbackUser = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          accountType,
          companyName: accountType === 'wholesale' ? formData.companyName : '',
          isLoggedIn: true,
          fallback: true,
          registeredAt: new Date().toISOString(),
        };
        localStorage.setItem('hualink_user', JSON.stringify(fallbackUser));
        localStorage.setItem('hualink_token', 'demo_token_123');
        localStorage.setItem('hualink_auth', 'active');
        localStorage.setItem('hualink_registered_email', formData.email);

        // Pre-fill checkout delivery cache with registered details
        const existingCheckoutInfo = JSON.parse(
          localStorage.getItem('checkout_delivery_info') || '{}'
        );
        localStorage.setItem(
          'checkout_delivery_info',
          JSON.stringify({
            ...existingCheckoutInfo,
            fullName: formData.fullName,
            customerPhone: formData.phone,
            region: formData.region,
            address: existingCheckoutInfo.address || ''
          })
        );

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authChange'));

        if (onRegisterSuccess) {
          onRegisterSuccess(fallbackUser);
        }

        // Auto login & redirect to landing marketplace
        navigate('/');
      } else {
        setError(
          err.response?.data?.message || err.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 flex flex-col">
      {/* Minimal Auth Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[#E50914] font-black italic text-xl">HUA</span>
              <span className="text-black italic font-bold text-lg tracking-tight">LINK</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-[#E50914] font-bold text-xs cursor-pointer transition-all"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Ken Burns zoom + fade-in animations for the hero image & badges */}
      <style>{`
        @keyframes kenBurns { from { transform: scale(1); } to { transform: scale(1.05); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatBadge {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>

      {/* Split 2-Column Layout */}
      <div className="min-h-[calc(100vh-80px)] w-full grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* Left Column - Hero Image with Feature Badges */}
        <div className="relative w-full h-full min-h-[550px] flex overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1505075489807-bfee9915866e?auto=format&fit=crop&q=80&w=1200"
            alt="Verified wholesale distribution warehouse"
            className="w-full h-full object-cover rounded-none md:rounded-r-3xl"
            style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }}
          />

          {/* Floating Feature Badges */}
          <div className="absolute top-10 right-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-slate-900 shadow-xl border-l-4 border-[#E50914] animate-bounce">
            Verified Suppliers
          </div>
          <div className="absolute top-1/3 left-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-slate-900 shadow-xl border-l-4 border-[#E50914] animate-pulse">
            Direct Factory Wholesale
          </div>
          <div className="absolute bottom-1/3 right-12 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-slate-900 shadow-xl border-l-4 border-[#E50914] animate-[floatBadge_4s_ease-in-out_infinite]">
            Fast Regional Delivery
          </div>

          {/* Disclaimer */}
          <div className="absolute bottom-3 left-6 text-[10px] text-white/80">
            *Eligibility restrictions apply. Terms & Conditions apply.
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="flex flex-col h-full min-h-[550px] p-8 md:p-12 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Create Your Hualink Account
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Join Tanzania's direct supply &amp; logistics distribution network
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2 mb-6">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Backend Unreachable Fallback Banner */}
          {fallbackBanner && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-xs font-bold flex items-center gap-2 mb-6">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Account Type Switcher */}
            <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAccountType('buyer')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountType === 'buyer'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShoppingBag size={16} className={accountType === 'buyer' ? 'text-red-600' : ''} />
                <span>Customer / Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('wholesale')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountType === 'wholesale'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building2 size={16} className={accountType === 'wholesale' ? 'text-red-600' : ''} />
                <span>Wholesale Partner</span>
              </button>
            </div>

            {/* Business Field */}
            {accountType === 'wholesale' && (
              <div className="fade-in">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Business / Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Building2 size={20} />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Hualink Retail Store"
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Phone & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+255..."
                    className="block w-full pl-11 pr-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Region
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {regions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Action */}
            <button
              type="submit"
              className="w-full mt-2 bg-[#E50914] text-white font-bold py-3.5 rounded-xl hover:bg-[#C0040F] transition-all flex items-center justify-center gap-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
              <ShieldCheck size={16} className="text-red-600" />
              <span>Secured Direct Distribution Portal</span>
            </div>

            <p className="text-center text-xs text-slate-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-red-600 hover:text-red-700">
                Sign In here
              </Link>
              &nbsp;•&nbsp;
              <Link to="/forgot-password" className="font-extrabold text-[#E50914] hover:text-[#C0040F]">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
