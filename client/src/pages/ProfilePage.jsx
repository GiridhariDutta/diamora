import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, Check, Save, Clock, 
  ShoppingBag, ArrowRight, Plus, Trash2, Edit3, Star, CreditCard, AlertCircle, X
} from 'lucide-react';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, onOpenAuthModal } = useOutletContext() || {};
  const navigate = useNavigate();
  const location = useLocation();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    aadhaar: ''
  });

  // Addresses State (Array of up to 10 addresses)
  const [addresses, setAddresses] = useState([]);
  
  // Address Modal/Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    altPhone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'orders'

  // Handle Tab from URL Query String (?tab=orders)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'addresses', 'orders'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch User Orders
  const fetchUserOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const uIdentifier = user.uid || user.id || user.email;
      const res = await api.get(`/api/orders?userId=${uIdentifier}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Fetch user orders error:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchUserOrders();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        aadhaar: user.aadhaar || ''
      });

      if (Array.isArray(user.addresses) && user.addresses.length > 0) {
        setAddresses(user.addresses);
      } else if (user.address) {
        // Fallback: migrate legacy single address to array format
        setAddresses([{
          id: 'legacy-1',
          name: user.name || '',
          phone: user.phone || '',
          altPhone: '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          isDefault: true
        }]);
      } else {
        setAddresses([]);
      }
    }
  }, [user]);

  // Helper to calculate Profile Completion Percentage
  const calculateCompletion = () => {
    let completedCount = 0;
    const totalFields = 4;

    if (profileData.name && profileData.name.trim() !== '') completedCount++;
    if (profileData.phone && profileData.phone.trim() !== '') completedCount++;
    if (profileData.aadhaar && profileData.aadhaar.trim().length >= 12) completedCount++;
    if (addresses.length > 0) completedCount++;

    return Math.round((completedCount / totalFields) * 100);
  };

  // Helper to extract clean display name
  const getCleanName = () => {
    if (!user) return 'Guest User';
    if (user.name && user.name.trim() !== '') {
      const clean = user.name.trim();
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    if (user.email) {
      const prefix = user.email.split('@')[0];
      const nameOnly = prefix.replace(/[0-9]/g, '');
      return nameOnly ? nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1) : prefix;
    }
    return 'Valued Member';
  };

  const handleDigitKeyDown = (e) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) ||
      (e.ctrlKey === true || e.metaKey === true)
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleProfileChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadhaar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }
    setProfileData({ ...profileData, [name]: value });
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const cleanPhone = profileData.phone.trim();
    const cleanAadhaar = profileData.aadhaar.trim();

    if (cleanPhone && cleanPhone.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits.');
      return;
    }

    if (cleanAadhaar && cleanAadhaar.length !== 12) {
      setErrorMessage('Aadhaar card number must be exactly 12 digits.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: profileData.name.trim(),
        phone: cleanPhone,
        aadhaar: cleanAadhaar
      };

      const res = await api.put('/api/auth/me', payload);
      if (res.data?.success) {
        setSuccessMessage('Personal profile updated successfully!');
        const updatedUser = res.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile save error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    if (addresses.length >= 10) {
      setErrorMessage('You have reached the maximum limit of 10 shipping addresses.');
      return;
    }
    setEditingAddressId(null);
    setAddressForm({
      name: user?.name || profileData.name || '',
      phone: user?.phone || profileData.phone || '',
      altPhone: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id || addr._id);
    setAddressForm({
      name: addr.name || '',
      phone: addr.phone || '',
      altPhone: addr.altPhone || '',
      address: addr.address || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: !!addr.isDefault
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressForm = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const cleanPhone = addressForm.phone.replace(/\D/g, '').slice(0, 10);
    const cleanAltPhone = addressForm.altPhone ? addressForm.altPhone.replace(/\D/g, '').slice(0, 10) : '';
    const cleanPincode = addressForm.pincode.replace(/\D/g, '').slice(0, 6);

    if (cleanPhone.length !== 10) {
      setErrorMessage('Recipient Phone number must be exactly 10 digits.');
      setAddressLoading(false);
      return;
    }

    if (cleanAltPhone && cleanAltPhone.length !== 10) {
      setErrorMessage('Alternative phone number must be exactly 10 digits.');
      setAddressLoading(false);
      return;
    }

    if (cleanPincode.length !== 6) {
      setErrorMessage('Pincode must be exactly 6 digits.');
      setAddressLoading(false);
      return;
    }

    const sanitizedForm = {
      ...addressForm,
      name: addressForm.name.trim(),
      phone: cleanPhone,
      altPhone: cleanAltPhone,
      address: addressForm.address.trim(),
      landmark: addressForm.landmark.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: cleanPincode
    };

    try {
      let updatedAddresses = [...addresses];

      if (editingAddressId) {
        // Edit existing
        updatedAddresses = updatedAddresses.map(addr => {
          if ((addr.id || addr._id) === editingAddressId) {
            return { ...addr, ...sanitizedForm, id: editingAddressId };
          }
          return sanitizedForm.isDefault ? { ...addr, isDefault: false } : addr;
        });
      } else {
        // Add new
        const newAddressObj = {
          ...sanitizedForm,
          id: 'addr_' + Date.now()
        };
        if (sanitizedForm.isDefault) {
          updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
        }
        updatedAddresses.push(newAddressObj);
      }

      // If set as default or first address, update legacy address fields as well
      const defaultAddr = updatedAddresses.find(a => a.isDefault) || updatedAddresses[0];

      const payload = {
        addresses: updatedAddresses,
        address: defaultAddr?.address || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || '',
        pincode: defaultAddr?.pincode || ''
      };

      const res = await api.put('/api/auth/me', payload);
      if (res.data?.success) {
        setAddresses(updatedAddresses);
        setSuccessMessage(editingAddressId ? 'Address updated!' : 'New shipping address added!');
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setIsAddressModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(res.data?.message || 'Failed to save address.');
      }
    } catch (err) {
      console.error('Address save error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (idToDelete) => {
    if (!window.confirm('Are you sure you want to remove this shipping address?')) return;

    setAddressLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let updatedAddresses = addresses.filter(a => (a.id || a._id) !== idToDelete);
      
      // If deleted address was default and remaining addresses exist, set first as default
      if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }

      const defaultAddr = updatedAddresses.find(a => a.isDefault) || updatedAddresses[0];

      const payload = {
        addresses: updatedAddresses,
        address: defaultAddr?.address || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || '',
        pincode: defaultAddr?.pincode || ''
      };

      const res = await api.put('/api/auth/me', payload);
      if (res.data?.success) {
        setAddresses(updatedAddresses);
        setSuccessMessage('Address removed.');
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Delete address error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to delete address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (targetId) => {
    setAddressLoading(true);
    try {
      const updatedAddresses = addresses.map(a => ({
        ...a,
        isDefault: (a.id || a._id) === targetId
      }));

      const defaultAddr = updatedAddresses.find(a => a.isDefault);

      const payload = {
        addresses: updatedAddresses,
        address: defaultAddr?.address || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || '',
        pincode: defaultAddr?.pincode || ''
      };

      const res = await api.put('/api/auth/me', payload);
      if (res.data?.success) {
        setAddresses(updatedAddresses);
        setSuccessMessage('Default delivery address updated!');
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Set default error:', err);
      setErrorMessage('Failed to update default address.');
    } finally {
      setAddressLoading(false);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#12131A] border border-[#E0B094]/30 rounded-xl p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="w-14 h-14 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 text-[#E0B094] flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7" />
          </div>
          <h2 className="font-cinzel text-xl font-bold text-white mb-2">Member Profile Access</h2>
          <p className="text-xs text-[#C5C8D0] leading-relaxed mb-5 font-open-sans">
            Please log in or sign up to view your luxury profile, manage shipping addresses, and track your artisan jewelry orders.
          </p>
          <button
            onClick={onOpenAuthModal}
            className="w-full py-3 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-semibold text-xs tracking-[0.2em] uppercase rounded-lg hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            LOG IN TO YOUR ACCOUNT
          </button>
        </div>
      </div>
    );
  }

  const displayName = getCleanName();
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const completionPercent = calculateCompletion();

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-open-sans select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP PROFILE HEADER BANNER */}
        <div className="relative bg-gradient-to-r from-[#12131A] via-[#161822] to-[#12131A] border border-[#E0B094]/30 rounded-xl p-5 sm:p-6 shadow-xl overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#E0B094]/5 blur-[70px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            {/* User Avatar & Identity Details */}
            <div className="flex items-center gap-4">
              
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#C59B27] via-[#D4AF37] to-[#F7E09A] p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <div className="w-full h-full rounded-full bg-[#0C0D10] flex items-center justify-center font-cinzel text-2xl sm:text-3xl font-bold text-[#E0B094]">
                    {avatarInitial}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#12131A] border border-[#E0B094]/50 flex items-center justify-center text-[#E0B094]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide">
                    {displayName}
                  </h1>
                  {user.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded bg-[#E0B094]/20 border border-[#E0B094]/40 text-[#E0B094] text-[9px] font-bold tracking-widest uppercase">
                      ADMINISTRATOR
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#C5C8D0] flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#E0B094]" />
                  <span>{user.email}</span>
                </p>

                {/* Profile Completion Bar */}
                <div className="pt-1.5 flex items-center gap-3">
                  <div className="w-36 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        completionPercent === 100 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                          : 'bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F7E09A]'
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-mono font-semibold ${completionPercent === 100 ? 'text-emerald-400' : 'text-[#E0B094]'}`}>
                    {completionPercent}% Complete
                  </span>
                </div>

              </div>

            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-[#E0B094]/40 hover:border-[#E0B094] bg-white/5 hover:bg-[#E0B094]/10 text-[#E0B094] text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse Collection</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] text-xs font-bold tracking-wider uppercase shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Admin Panel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 border-t border-white/10 mt-5 pt-3.5 text-xs font-semibold tracking-widest uppercase">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'border-[#E0B094] text-[#E0B094]' : 'border-transparent text-[#C5C8D0] hover:text-[#E0B094]'
              }`}
            >
              Personal Details & Aadhaar
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'addresses' ? 'border-[#E0B094] text-[#E0B094]' : 'border-transparent text-[#C5C8D0] hover:text-[#E0B094]'
              }`}
            >
              <span>Saved Shipping Addresses</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#E0B094]/20 text-[#E0B094] text-[10px] font-mono">
                {addresses.length}/10
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'orders' ? 'border-[#E0B094] text-[#E0B094]' : 'border-transparent text-[#C5C8D0] hover:text-[#E0B094]'
              }`}
            >
              My Orders & Inquiries
            </button>
          </div>

        </div>

        {/* NOTIFICATION ALERTS */}
        {successMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: PERSONAL DETAILS & AADHAAR */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-[#12131A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#E0B094]" />
                <h2 className="font-cinzel text-base font-bold text-white tracking-wide">
                  Account Identification & Profile Details
                </h2>
              </div>
              {completionPercent < 100 && (
                <span className="text-[11px] text-[#E0B094] italic font-light">
                  Fill in your phone & 12-digit Aadhaar to complete profile setup.
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="e.g. Goutam Jana"
                  className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Email Address (Read Only) */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[#C5C8D0]/40 font-normal lowercase">(registered)</span>
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[#0C0D10]/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white/50 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1.5">
                  Phone / Mobile Number *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  onKeyDown={handleDigitKeyDown}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none font-mono transition-colors"
                />
              </div>

              {/* Aadhaar Number */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Aadhaar Card Number</span>
                  <span className="text-[10px] text-[#C5C8D0]/50 normal-case">Encrypted for verification</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="aadhaar"
                  value={profileData.aadhaar}
                  onChange={handleProfileChange}
                  onKeyDown={handleDigitKeyDown}
                  maxLength={12}
                  placeholder="12-digit Aadhaar number"
                  className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none font-mono transition-colors"
                />
              </div>

            </div>

            {/* Save Profile Button */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.15em] uppercase rounded-lg hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Information'}</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: SAVED SHIPPING ADDRESSES (UP TO 10) */}
        {activeTab === 'addresses' && (
          <div className="bg-[#12131A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#E0B094]" />
                <h2 className="font-cinzel text-base font-bold text-white tracking-wide">
                  Saved Shipping Addresses ({addresses.length}/10)
                </h2>
              </div>

              <button
                onClick={handleOpenAddAddress}
                disabled={addresses.length >= 10}
                className="px-4 py-2 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            {addresses.length === 0 ? (
              <div className="p-8 text-center bg-[#0C0D10] border border-dashed border-white/15 rounded-xl space-y-3">
                <MapPin className="w-8 h-8 text-[#E0B094]/60 mx-auto" />
                <h3 className="font-cinzel text-sm font-semibold text-white">No Shipping Addresses Saved</h3>
                <p className="text-xs text-[#C5C8D0] max-w-sm mx-auto">
                  Add up to 10 delivery addresses for fast checkout when ordering your diamond jewelry.
                </p>
                <button
                  onClick={handleOpenAddAddress}
                  className="px-5 py-2 rounded-lg border border-[#E0B094]/40 hover:border-[#E0B094] text-[#E0B094] text-xs font-semibold tracking-wider uppercase"
                >
                  + Add Address Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                  <div
                    key={addr.id || addr._id || idx}
                    className={`bg-[#0C0D10] border rounded-xl p-4 space-y-3 relative transition-all ${
                      addr.isDefault 
                        ? 'border-[#E0B094] shadow-[0_0_15px_rgba(224,176,148,0.15)]' 
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    {/* Header line with Default Badge */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {addr.name || 'Recipient'}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-[#E0B094]/20 border border-[#E0B094]/40 text-[#E0B094] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-[#E0B094]" />
                            DEFAULT ADDRESS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1 text-[#C5C8D0] hover:text-[#E0B094] transition-colors"
                          title="Edit Address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id || addr._id)}
                          className="p-1 text-[#C5C8D0] hover:text-rose-400 transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Address details */}
                    <div className="text-xs text-[#C5C8D0] space-y-1 font-light">
                      <p className="text-white/90 font-normal">{addr.address}</p>
                      {addr.landmark && (
                        <p className="text-[#E0B094]/80 text-[11px] font-normal">Landmark: {addr.landmark}</p>
                      )}
                      <p>{addr.city}, {addr.state} - <span className="font-mono text-white">{addr.pincode}</span></p>
                      <div className="pt-1 text-[11px] text-[#C5C8D0]/70 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Phone: <strong className="text-white font-mono">{addr.phone}</strong></span>
                        {addr.altPhone && <span>Alt: <strong className="text-white font-mono">{addr.altPhone}</strong></span>}
                      </div>
                    </div>

                    {/* Action Bar */}
                    {!addr.isDefault && (
                      <div className="pt-2 border-t border-white/10 flex justify-end">
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id || addr._id)}
                          className="text-[10px] text-[#E0B094] hover:underline tracking-wider uppercase font-semibold"
                        >
                          Set as Default Address
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: MY ORDERS & INQUIRIES */}
        {activeTab === 'orders' && (
          <div className="bg-[#12131A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#E0B094]" />
                <h2 className="font-cinzel text-base font-bold text-white tracking-wide">
                  My Orders & Atelier Purchases ({orders.length})
                </h2>
              </div>
              <button
                onClick={fetchUserOrders}
                className="text-xs text-[#E0B094] hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider"
              >
                Refresh List
              </button>
            </div>

            {ordersLoading ? (
              <div className="p-8 text-center text-xs text-[#C5C8D0]">
                Loading your order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-[#0C0D10] border border-dashed border-white/15 rounded-xl space-y-3">
                <ShoppingBag className="w-8 h-8 text-[#E0B094]/60 mx-auto" />
                <h3 className="font-cinzel text-sm font-semibold text-white">No Orders Found</h3>
                <p className="text-xs text-[#C5C8D0] max-w-sm mx-auto leading-relaxed">
                  You haven't placed any diamond orders yet. Browse our atelier collection to discover exquisite creations.
                </p>
                <button
                  onClick={() => navigate('/shop')}
                  className="px-5 py-2 rounded-lg border border-[#E0B094]/40 hover:border-[#E0B094] bg-white/5 text-[#E0B094] text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const dateStr = ord.createdAt 
                    ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Recent Order';

                  const orderItems = Array.isArray(ord.items) && ord.items.length > 0 
                    ? ord.items 
                    : [{
                        title: ord.productTitle || 'Haute Joaillerie Piece',
                        image: ord.productImage || '',
                        price: ord.productPrice || ord.totalAmount || 0,
                        quantity: 1,
                        metal: ord.selectedMetal,
                        color: ord.selectedColor
                      }];

                  return (
                    <div 
                      key={ord.id} 
                      className="bg-[#0C0D10] border border-white/10 hover:border-[#E0B094]/50 rounded-xl p-4 sm:p-5 space-y-4 transition-all"
                    >
                      {/* ORDER TOP METADATA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#E0B094] font-bold">
                              Order #{ord.id?.slice(-8)?.toUpperCase() || ord.id}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9.5px] font-bold uppercase tracking-wider">
                              {ord.paymentStatus || ord.status || 'Paid'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#C5C8D0]/60 mt-0.5">Placed on {dateStr}</p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-[#C5C8D0]/50 uppercase tracking-wider block">Total Amount</span>
                          <span className="font-mono text-base font-bold text-emerald-400">
                            ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* ITEMS LIST */}
                      <div className="space-y-3">
                        {orderItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" 
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#E0B094]">
                                  <ShoppingBag className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-white text-xs">{item.title}</h4>
                                <div className="text-[11px] text-[#C5C8D0]/70 flex items-center gap-2">
                                  <span>Qty: <strong className="text-white">{item.quantity || 1}</strong></span>
                                  {item.metal && <span>• Metal: {item.metal}</span>}
                                  {item.color && <span>• Color: {item.color}</span>}
                                </div>
                              </div>
                            </div>

                            <span className="font-mono font-medium text-white text-xs">
                              ₹{(Number(item.price || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* PAYMENT & SHIPPING FOOTER */}
                      <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#C5C8D0]/80">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[#E0B094] block mb-0.5">Shipping Address</span>
                          <p className="text-white">{ord.customerName} ({ord.customerPhone})</p>
                          <p className="line-clamp-2">{ord.shippingAddress} {ord.landmark ? `(Near ${ord.landmark})` : ''}, {ord.city}, {ord.state} - {ord.pincode}</p>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-[10px] uppercase font-semibold text-[#E0B094] block mb-0.5">Payment Reference</span>
                          <p>Gateway: <strong className="text-white">{ord.paymentMethod || 'Razorpay Online'}</strong></p>
                          {ord.razorpayPaymentId && (
                            <p className="font-mono text-[10px] text-white/70">Payment ID: {ord.razorpayPaymentId}</p>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ADD / EDIT ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#12131A] border border-[#E0B094]/40 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xl relative animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white">
                {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 text-[#C5C8D0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddressForm} className="space-y-3 text-xs">
              
              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    maxLength={100}
                    placeholder="Goutam Jana"
                    className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    onKeyDown={handleDigitKeyDown}
                    maxLength={10}
                    placeholder="10-digit phone"
                    className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Alternative Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                  Alternative Phone Number <span className="text-[#C5C8D0]/50 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={addressForm.altPhone}
                  onChange={(e) => setAddressForm({ ...addressForm, altPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  onKeyDown={handleDigitKeyDown}
                  maxLength={10}
                  placeholder="10-digit alt phone"
                  className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                  Street Address / Flat / Building *
                </label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  maxLength={100}
                  placeholder="Flat 4B, Diamond Residency, Park Street"
                  className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                  required
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                  Landmark <span className="text-[#C5C8D0]/50 lowercase font-normal">(optional e.g. Near Park Metro)</span>
                </label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  maxLength={100}
                  placeholder="e.g. Opposite City Mall / Near Metro Station"
                  className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              {/* City, State & Pincode */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    maxLength={100}
                    placeholder="Kolkata"
                    className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    maxLength={100}
                    placeholder="West Bengal"
                    className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    onKeyDown={handleDigitKeyDown}
                    maxLength={6}
                    placeholder="6 digits"
                    className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded accent-[#E0B094]"
                />
                <label htmlFor="isDefault" className="text-xs text-[#C5C8D0] cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-[#C5C8D0] hover:text-white uppercase text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
                >
                  {addressLoading ? 'Saving...' : editingAddressId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

