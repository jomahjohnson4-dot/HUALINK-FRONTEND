import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertCircle 
} from 'lucide-react';
import API from '../api/axios';

export default function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    region: 'Dar es Salaam',
    password: '',
    companyName: '',
  });

  const regions = [
    'Dar es Salaam',
    'Mbeya',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Tanga',
    'Morogoro',
    'Zanzibar',
    'Other Region'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const payload = { accountType, ...formData };
      const response = await API.post('/auth/register', payload);
      const { token, user } = response.data;

      // Store JWT token and user session data
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      if (onRegisterSuccess) {
        onRegisterSuccess(user || response.data);
      }

      navigate('/shop');
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-red-600 flex items-center justify-center font-black tracking-tighter text-lg bg-white shadow-xs">
            <span className="text-red-600 italic">H</span>
            <span className="text-black italic -ml-0.5">L</span>
          </div>
          <div className="flex flex-col text-left">
            <div className="text-2xl font-black italic tracking-wide">
              <span className="text-red-600">HUA</span>
              <span className="text-black">LINK</span>
            </div>
            <span className="text-[10px] text-black font-extrabold tracking-[0.25em] uppercase">
              DISTRIBUTION
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-3xl font-black text-slate-900 tracking-tight">
          Create Your Hualink Account
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Join Tanzania's direct supply & logistics distribution network
        </p>
      </div>

      {/* Register Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/60 rounded-3xl border border-slate-100 sm:px-12 space-y-6">
          
          {/* Account Type Selector Switch */}
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

          {/* Error Alert Display */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Wholesale Business Name Field */}
            {accountType === 'wholesale' && (
              <div>
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

            {/* Full Name Field */}
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

            {/* Email Field */}
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

            {/* Phone & Region Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Field */}
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

              {/* Region Select */}
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

            {/* Password Field */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 transition-all cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
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
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}