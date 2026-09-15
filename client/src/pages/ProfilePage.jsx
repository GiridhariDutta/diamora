import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ShieldCheck, Check, Save, Lock, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, onOpenAuthModal } = useOutletContext() || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders' | 'security'

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  // Helper to extract clean display name
  const getCleanName = () => {
    if (!user) return 'Guest User';
    if (user.name && user.name.trim() !== '') {
      // If name is just an email prefix with numbers, format it nicely or return as is
      const clean = user.name.trim();
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    if (user.email) {
      const prefix = user.email.split('@')[0];
      // Strip numbers if prefix has numbers e.g. janagoutam147 -> Jana Goutam
      const nameOnly = prefix.replace(/[0-9]/g, '');
      return nameOnly ? nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1) : prefix;
    }
    return 'Valued Member';
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await api.put('/api/auth/me', formData);
      if (res.data?.success) {
        setSuccessMessage('Profile updated successfully!');
        // Update user session in localStorage
        const updatedUser = res.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Reload page context or update local state after 1 sec
        setTimeout(() => {
          setSuccessMessage('');
          window.location.reload();
        }, 1200);
      } else {
        throw new Error(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#12131A] border border-[#E0B094]/30 rounded-3xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="w-16 h-16 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 text-[#E0B094] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-white mb-2">Member Profile Access</h2>
          <p className="text-xs text-[#C5C8D0] leading-relaxed mb-6 font-open-sans">
            Please log in or sign up to view your luxury profile, manage personal details, and track your artisan jewelry orders.
          </p>
          <button
            onClick={onOpenAuthModal}
            className="w-full py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-semibold text-xs tracking-[0.2em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
          >
            LOG IN TO YOUR ACCOUNT
          </button>
        </div>
      </div>
    );
  }

  const displayName = getCleanName();
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 sm:pt-28 pb-16 px-4 sm:px-8 lg:px-12 font-open-sans select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP PROFILE HEADER BANNER */}
        <div className="relative bg-gradient-to-r from-[#12131A] via-[#161822] to-[#12131A] border border-[#E0B094]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#E0B094]/5 blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* User Avatar & Identity Details */}
            <div className="flex items-center gap-5">
              
              {/* Luxury Initial Circle Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#C59B27] via-[#D4AF37] to-[#F7E09A] p-[2px] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                  <div className="w-full h-full rounded-full bg-[#0C0D10] flex items-center justify-center font-cinzel text-3xl sm:text-4xl font-bold text-[#E0B094]">
                    {avatarInitial}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#12131A] border border-[#E0B094]/50 flex items-center justify-center text-[#E0B094]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Name & Account Type */}
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide">
                    {displayName}
                  </h1>
                  {user.role === 'admin' && (
                    <span className="px-2.5 py-0.5 rounded bg-[#E0B094]/20 border border-[#E0B094]/40 text-[#E0B094] text-[10px] font-bold tracking-widest uppercase">
                      ADMINISTRATOR
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#C5C8D0] flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#E0B094]" />
                  <span>{user.email}</span>
                </p>

                <p className="text-[11px] text-[#C5C8D0]/60 flex items-center gap-1.5 font-normal pt-0.5">
                  <Clock className="w-3 h-3 text-[#E0B094]" />
                  <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}</span>
                </p>
              </div>

            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-[#E0B094]/40 hover:border-[#E0B094] bg-white/5 hover:bg-[#E0B094]/10 text-[#E0B094] text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Shop</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] text-xs font-bold tracking-wider uppercase shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span>Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 border-t border-white/10 mt-6 pt-4 text-xs font-semibold tracking-widest uppercase">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'profile' ? 'border-[#E0B094] text-[#E0B094]' : 'border-transparent text-[#C5C8D0] hover:text-[#E0B094]'
              }`}
            >
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'orders' ? 'border-[#E0B094] text-[#E0B094]' : 'border-transparent text-[#C5C8D0] hover:text-[#E0B094]'
              }`}
            >
              My Orders & Inquiries
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'security' ? 'border-[#E0B094] text-[#E0B094]' : 'border-transparent text-[#C5C8D0] hover:text-[#E0B094]'
              }`}
            >
              Security Settings
            </button>
          </div>

        </div>

        {/* NOTIFICATION ALERTS */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3 animate-fade-in font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3 animate-fade-in font-medium">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: EDITABLE PROFILE FORM */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Personal Details Section (Span 7) */}
            <div className="lg:col-span-7 bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <User className="w-5 h-5 text-[#E0B094]" />
                <h2 className="font-cinzel text-lg font-bold text-white tracking-wide">Personal Details</h2>
              </div>

              <div className="space-y-4">
                
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Goutam Jana"
                      className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                    Email Address <span className="text-[#C5C8D0]/40 font-normal lowercase">(read-only)</span>
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-[#0C0D10]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/50 cursor-not-allowed"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>

              </div>

            </div>

            {/* Shipping & Billing Address (Span 5) */}
            <div className="lg:col-span-5 bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
              
              <div>
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <MapPin className="w-5 h-5 text-[#E0B094]" />
                  <h2 className="font-cinzel text-lg font-bold text-white tracking-wide">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House / Apartment / Street Name"
                      className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Kolkata"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="West Bengal"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                      Pincode / ZIP
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="700001"
                      className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                    />
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.2em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                </button>
              </div>

            </div>

          </form>
        )}

        {/* TAB 2: MY ORDERS & INQUIRIES */}
        {activeTab === 'orders' && (
          <div className="bg-[#12131A] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 text-[#E0B094] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel text-xl font-bold text-white">Your Orders & Atelier Inquiries</h3>
            <p className="text-xs text-[#C5C8D0] max-w-md mx-auto leading-relaxed">
              When you submit a luxury jewelry inquiry or purchase a masterpiece, your custom order details and certificate tracking will appear here.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-2.5 rounded-xl border border-[#E0B094]/40 hover:border-[#E0B094] bg-white/5 text-[#E0B094] text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Explore Atelier Collection
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY SETTINGS */}
        {activeTab === 'security' && (
          <div className="bg-[#12131A] border border-white/10 rounded-3xl p-8 text-left space-y-6 shadow-xl max-w-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Lock className="w-5 h-5 text-[#E0B094]" />
              <h2 className="font-cinzel text-lg font-bold text-white tracking-wide">Account Security</h2>
            </div>
            
            <div className="space-y-4 text-xs text-[#C5C8D0]">
              <div className="p-4 rounded-2xl bg-[#0C0D10] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Firebase Authentication</p>
                  <p className="text-[11px] text-[#C5C8D0]/60">Your account is secured via Firebase Identity Encryption.</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  ACTIVE
                </span>
              </div>

              <p className="text-[11px] text-[#C5C8D0]/70 leading-relaxed">
                To reset or change your password, use the Firebase Auth link or re-authenticate through Google / Email sign-in.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
