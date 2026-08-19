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
  CheckCircle2
} from 'lucide-react';
import API from '../api/axios';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle Main Login Form Submission via Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', formData);
      const { token, user } = response.data;

      // Persist Session Token and User Payload
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      if (onLoginSuccess) {
        onLoginSuccess(user || response.data);
      }

      navigate('/shop');
    } catch (err) {
      console.error('Login authentication error:', err);
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Password Reset OTP
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetError('');

    try {
      await API.post('/auth/forgot-password', { email: resetEmail });
      setResetStep(2);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) return;
    setResetLoading(true);
    setResetError('');

    try {
      await API.post('/auth/verify-otp', { email: resetEmail, otp: otpCode });
      setResetStep(3);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3: Save New Password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    setResetLoading(true);
    setResetError('');

    try {
      await API.post('/auth/reset-password', {
        email: resetEmail,
        otp: otpCode,
        newPassword,
      });
      setResetStep(4);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setIsForgotModalOpen(false);
    setResetStep(1);
    setResetEmail('');
    setOtpCode('');
    setNewPassword('');
    setResetError('');
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
          Welcome Back
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Sign in to access your orders and distribution portal
        </p>
      </div>

      {/* Login Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/60 rounded-3xl border border-slate-100 sm:px-12 space-y-6">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
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
              Don't have an account?{' '}
              <Link to="/register" className="font-extrabold text-red-600 hover:text-red-700">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-slate-100 shadow-2xl relative space-y-6">
            
            {/* Modal Close Button */}
            <button
              onClick={closeResetModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {/* Step 1: Send Code */}
            {resetStep === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Enter your account email address to receive a verification code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20"
                >
                  {resetLoading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Enter Verification Code</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    We sent a verification code to <span className="font-bold text-slate-900">{resetEmail}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black tracking-widest focus:bg-white focus:border-red-600 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20"
                >
                  {resetLoading ? 'Verifying Code...' : 'Verify Code'}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {resetStep === 3 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Set New Password</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Create a new password for your account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20"
                >
                  {resetLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}

            {/* Step 4: Success View */}
            {resetStep === 4 && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Password Reset Complete</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>
                <button
                  onClick={closeResetModal}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}