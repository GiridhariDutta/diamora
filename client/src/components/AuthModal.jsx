import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../api/axios';
import { setCookie } from '../utils/cookies';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
      setLoading(false);
      setShowPassword(false);
      setFormData({ name: '', email: '', password: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/register';
    const payload = isLoginTab
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await api.post(endpoint, payload);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      // Store JWT token in cookie (expires in 7 days) and user info in localStorage
      setCookie('token', data.data.token, 7);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setSuccess(isLoginTab ? 'Welcome back! Logged in successfully.' : 'Account created successfully!');
      
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.data.user);
        onClose();
      }, 1200);

    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Trigger Firebase Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Exchange Firebase ID token with backend API via Axios
      const response = await api.post('/api/auth/firebase-login', { idToken });
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Google Sign-In backend verification failed.');
      }

      // Store JWT token in cookie (expires in 7 days) and user info in localStorage
      setCookie('token', data.data.token, 7);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setSuccess('Signed in with Google successfully!');
      
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.data.user);
        onClose();
      }, 1200);

    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-poppins">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-[#0C0D10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden p-6 sm:p-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Subtle Gold Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E0B094]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-[#E0B094] transition-colors p-1.5 rounded-full hover:bg-white/5 focus:outline-none"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-2">
            <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F0] via-[#E0B094] to-[#D4AF37] uppercase">
              DIAMORA
            </span>
          </div>
          <p className="text-xs text-[#C5C8D0] tracking-wider uppercase">
            {isLoginTab ? 'Access Your Private Vault' : 'Join The Circle of Excellence'}
          </p>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => { setIsLoginTab(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-xs font-semibold tracking-[0.15em] transition-colors relative uppercase ${
              isLoginTab ? 'text-[#E0B094]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            LOG IN
            {isLoginTab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E0B094] shadow-[0_0_8px_rgba(224,176,148,0.8)]" />
            )}
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-xs font-semibold tracking-[0.15em] transition-colors relative uppercase ${
              !isLoginTab ? 'text-[#E0B094]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            SIGN UP
            {!isLoginTab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E0B094] shadow-[0_0_8px_rgba(224,176,148,0.8)]" />
            )}
          </button>
        </div>

        {/* Notification Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Full Name Input (Sign Up Only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-[10px] font-medium tracking-widest text-[#C5C8D0] uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required={!isLoginTab}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/15 rounded-lg text-xs text-[#F5F5F0] placeholder-gray-500 focus:outline-none focus:border-[#E0B094] focus:ring-1 focus:ring-[#E0B094] transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-medium tracking-widest text-[#C5C8D0] uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/15 rounded-lg text-xs text-[#F5F5F0] placeholder-gray-500 focus:outline-none focus:border-[#E0B094] focus:ring-1 focus:ring-[#E0B094] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-medium tracking-widest text-[#C5C8D0] uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/15 rounded-lg text-xs text-[#F5F5F0] placeholder-gray-500 focus:outline-none focus:border-[#E0B094] focus:ring-1 focus:ring-[#E0B094] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E0B094] transition-colors focus:outline-none p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-[#E0B094] to-[#D4AF37] hover:from-[#d19c7f] hover:to-[#c29f2e] text-[#0C0D10] font-semibold text-xs tracking-widest uppercase rounded-lg shadow-lg shadow-[#E0B094]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLoginTab ? 'LOG IN' : 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0C0D10] px-3 text-[10px] tracking-widest text-gray-500 uppercase absolute">
            OR
          </span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-[#F5F5F0] font-medium text-xs tracking-wider rounded-lg flex items-center justify-center gap-3 transition-all focus:outline-none disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </button>

      </div>
    </div>
  );
}
