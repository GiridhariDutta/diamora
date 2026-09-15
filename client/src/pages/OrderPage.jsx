import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Award, Lock, 
  Check, Truck, CreditCard, Banknote, MapPin, User as UserIcon, Mail, Phone, Loader2, Sparkles 
} from 'lucide-react';
import { getCart, clearCart, getProductImage } from '../utils/cartManager';
import api from '../api/axios';

export default function OrderPage() {
  const navigate = useNavigate();
  const { user } = useOutletContext() || {};

  const [currentStep, setCurrentStep] = useState(1); // Step 1: Breakdown | Step 2: Details | Step 3: Payment
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 2 Form State (Pre-filled from User Profile)
  const [shippingDetails, setShippingDetails] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  // Step 3 Payment State
  const [paymentMethod, setPaymentMethod] = useState('Online Payment'); // 'Online Payment' | 'Cash on Delivery'

  // 1. Fetch live product data on mount
  useEffect(() => {
    loadCheckoutCartData();
  }, []);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Pre-fill user shipping details from saved addresses
  useEffect(() => {
    if (user) {
      const savedList = Array.isArray(user.addresses) ? user.addresses : [];
      const defaultAddr = savedList.find(a => a.isDefault) || savedList[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id || defaultAddr._id);
        setShippingDetails(prev => ({
          ...prev,
          customerName: prev.customerName || defaultAddr.name || user.name || '',
          customerPhone: prev.customerPhone || defaultAddr.phone || user.phone || '',
          customerEmail: prev.customerEmail || user.email || '',
          shippingAddress: prev.shippingAddress || defaultAddr.address || user.address || '',
          landmark: prev.landmark || defaultAddr.landmark || '',
          city: prev.city || defaultAddr.city || user.city || '',
          state: prev.state || defaultAddr.state || user.state || '',
          pincode: prev.pincode || defaultAddr.pincode || user.pincode || ''
        }));
      } else {
        setShippingDetails(prev => ({
          ...prev,
          customerName: prev.customerName || user.name || '',
          customerPhone: prev.customerPhone || user.phone || '',
          customerEmail: prev.customerEmail || user.email || '',
          shippingAddress: prev.shippingAddress || user.address || '',
          landmark: prev.landmark || '',
          city: prev.city || user.city || '',
          state: prev.state || user.state || '',
          pincode: prev.pincode || user.pincode || ''
        }));
      }
    }
  }, [user]);

  const selectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id || addr._id);
    setShippingDetails(prev => ({
      ...prev,
      customerName: addr.name || user?.name || '',
      customerPhone: addr.phone || user?.phone || '',
      customerEmail: user?.email || prev.customerEmail || '',
      shippingAddress: addr.address || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    }));
  };

  const loadCheckoutCartData = async () => {
    const rawCart = getCart();
    if (!rawCart || rawCart.length === 0) {
      setCartItems([]);
      setCartTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/api/products?limit=500');
      let productsList = [];
      if (res.data?.success && Array.isArray(res.data.data)) {
        productsList = res.data.data;
      }

      const productMap = new Map();
      productsList.forEach(p => {
        if (p.id) productMap.set(String(p.id), p);
        if (p._id) productMap.set(String(p._id), p);
        if (p.sku) productMap.set(String(p.sku), p);
      });

      const resolvedItems = await Promise.all(rawCart.map(async (item) => {
        let liveProduct = productMap.get(String(item.productId));

        if (!liveProduct) {
          try {
            const singleRes = await api.get(`/api/products/${item.productId}`);
            if (singleRes.data?.success && singleRes.data.data) {
              liveProduct = singleRes.data.data;
            }
          } catch (e) {
            console.warn(`Product ${item.productId} checkout fetch error:`, e);
          }
        }

        const price = Number(liveProduct?.grandTotal || liveProduct?.computedGoldPrice || liveProduct?.price || 0);
        const img = getProductImage(liveProduct);
        const title = liveProduct?.title || liveProduct?.name || 'Haute Joaillerie Masterpiece';
        const categoryTitle = liveProduct?.categoryTitle || liveProduct?.category || 'DIAMORA LUXURY';

        return {
          ...item,
          product: liveProduct,
          title,
          categoryTitle,
          image: img,
          price,
          subtotal: price * (item.quantity || 1)
        };
      }));

      setCartItems(resolvedItems);
      const total = resolvedItems.reduce((acc, i) => acc + (i.subtotal || 0), 0);
      setCartTotal(total);
    } catch (err) {
      console.error('Error loading checkout items:', err);
    } finally {
      setLoading(false);
    }
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const checkProfileCompleteness = () => {
    const name = (user?.name || shippingDetails.customerName || '').trim();
    const email = (user?.email || shippingDetails.customerEmail || '').trim();
    const phone = (user?.phone || shippingDetails.customerPhone || '').replace(/\D/g, '');
    const aadhaar = (user?.aadhaar || '').replace(/\D/g, '');

    const missing = [];
    if (!name || name.length < 2) missing.push('Full Legal Name');
    if (!email || !email.includes('@')) missing.push('Email Address');
    if (phone.length !== 10) missing.push('10-digit Phone Number');
    if (aadhaar.length !== 12) missing.push('12-digit Aadhaar Card Number');

    return {
      isComplete: missing.length === 0,
      missingFields: missing
    };
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

  const handleShippingChange = (e) => {
    let { name, value } = e.target;
    if (name === 'customerPhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    setShippingDetails({
      ...shippingDetails,
      [name]: value
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleStep1Submit = () => {
    if (cartItems.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!shippingDetails.customerName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    const cleanPhone = shippingDetails.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Phone Number.');
      return;
    }
    if (!shippingDetails.shippingAddress.trim()) {
      setErrorMessage('Please enter your Shipping Address.');
      return;
    }
    if (shippingDetails.pincode && shippingDetails.pincode.replace(/\D/g, '').length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Pincode.');
      return;
    }

    // MANDATORY PROFILE COMPLETENESS CHECK BEFORE STEP 3
    const profileCheck = checkProfileCompleteness();
    if (!profileCheck.isComplete) {
      setMissingFields(profileCheck.missingFields);
      setShowProfileModal(true);
      return;
    }

    setErrorMessage('');
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRazorpayPayment = async () => {
    // Double check profile completeness
    const profileCheck = checkProfileCompleteness();
    if (!profileCheck.isComplete) {
      setMissingFields(profileCheck.missingFields);
      setShowProfileModal(true);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Call Backend to verify product prices and create Razorpay order
      const createRes = await api.post('/api/orders/create-razorpay-order', {
        items: cartItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          title: i.title,
          categoryTitle: i.categoryTitle,
          image: i.image,
          options: i.options
        })),
        shippingDetails,
        totalAmount: cartTotal,
        userId: user?.uid || user?.id || user?._id || ''
      });

      if (!createRes.data?.success) {
        throw new Error(createRes.data?.message || 'Failed to create payment order.');
      }

      const { razorpayOrderId, amount, currency, keyId, verifiedTotal } = createRes.data.data;

      // 2. Load Razorpay Checkout SDK Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your internet connection.');
      }

      // 3. Open Razorpay Payment Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'DIAMORA Luxury Vault',
        description: cartItems[0]?.title || 'Certified Diamond Jewelry Purchase',
        image: cartItems[0]?.image || '',
        order_id: razorpayOrderId,
        prefill: {
          name: shippingDetails.customerName,
          email: shippingDetails.customerEmail || user?.email || '',
          contact: shippingDetails.customerPhone
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI (Scan QR or App)',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['qr', 'collect', 'intent'],
                    apps: ['google_pay', 'phonepe', 'paytm', 'bhim']
                  }
                ]
              },
              other: {
                name: 'Cards, Netbanking & Wallets',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ]
              }
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: {
          color: '#D4AF37'
        },
        handler: async function (response) {
          try {
            setSubmitting(true);
            // 4. Verify Payment Signature & Save Order in Backend
            const verifyRes = await api.post('/api/orders/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.price,
                title: i.title,
                categoryTitle: i.categoryTitle,
                image: i.image,
                options: i.options
              })),
              shippingDetails,
              totalAmount: verifiedTotal,
              userId: user?.uid || user?.id || user?._id || ''
            });

            if (verifyRes.data?.success) {
              clearCart();
              setOrderSuccess(verifyRes.data.data);
            } else {
              throw new Error(verifyRes.data?.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setErrorMessage(verifyErr.response?.data?.message || verifyErr.message || 'Payment signature verification failed.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setErrorMessage(response.error?.description || 'Payment failed. Please try again.');
        setSubmitting(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Razorpay process error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Payment initialization failed.');
      setSubmitting(false);
    }
  };

  const formattedTotal = Number(cartTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-32 pb-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#E0B094] animate-spin" />
        <p className="text-xs font-mono text-[#C5C8D0] uppercase tracking-widest">
          Preparing Luxury Checkout Experience...
        </p>
      </div>
    );
  }

  // ORDER SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-16 px-4 sm:px-8 font-open-sans flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#12131A] border border-[#E0B094]/40 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#E0B094]/10 blur-[90px] pointer-events-none" />

          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-[#E0B094] tracking-widest uppercase block">
              ORDER CONFIRMED • ID: #{orderSuccess.id?.slice(-8).toUpperCase()}
            </span>
            <h1 className="font-cinzel text-3xl font-bold text-white">
              Thank You for Your Order
            </h1>
            <p className="text-xs text-[#C5C8D0] max-w-lg mx-auto leading-relaxed">
              Your Haute Joaillerie order has been successfully placed into our secure vault dispatch system. A master jeweler will inspect and certify your selections prior to insured courier transit.
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-[#0C0D10] border border-white/10 rounded-2xl p-5 text-left text-xs space-y-3 font-light">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[#C5C8D0]">Recipient Name:</span>
              <strong className="text-white font-medium">{orderSuccess.customerName}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[#C5C8D0]">Delivery Address:</span>
              <span className="text-white font-medium text-right max-w-xs truncate">
                {orderSuccess.shippingAddress}, {orderSuccess.city}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[#C5C8D0]">Payment Method:</span>
              <span className="text-[#E0B094] font-medium">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#C5C8D0]">Order Total:</span>
              <strong className="text-[#E0B094] font-mono text-base">
                ₹{Number(orderSuccess.totalAmount || cartTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.2em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.35)] cursor-pointer"
            >
              VIEW MY ORDERS IN PROFILE
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-white/5 border border-white/15 text-[#E0B094] font-semibold text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-white/10 transition-all cursor-pointer"
            >
              CONTINUE SHOPPING
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 sm:pt-28 pb-16 px-4 sm:px-8 lg:px-12 font-open-sans select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-[#C5C8D0] uppercase tracking-wider font-light">
            <Link to="/" className="hover:text-[#E0B094]">HOME</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-[#E0B094]">CART</Link>
            <span>/</span>
            <span className="text-[#E0B094] font-normal">CHECKOUT</span>
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-2 text-xs text-[#E0B094] hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Cart</span>
          </Link>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-[#12131A] border border-white/10 rounded-xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between max-w-3xl mx-auto text-xs font-semibold">
            
            {/* Step 1 Indicator */}
            <div 
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2.5 cursor-pointer transition-colors ${
                currentStep >= 1 ? 'text-[#E0B094]' : 'text-gray-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${
                currentStep === 1 
                  ? 'bg-[#E0B094] text-black border-[#E0B094]' 
                  : currentStep > 1 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="hidden sm:inline uppercase tracking-wider">1. Order Items</span>
            </div>

            <div className={`flex-1 h-[1px] mx-4 transition-colors ${currentStep > 1 ? 'bg-[#E0B094]' : 'bg-white/10'}`} />

            {/* Step 2 Indicator */}
            <div 
              onClick={() => cartItems.length > 0 && setCurrentStep(2)}
              className={`flex items-center gap-2.5 cursor-pointer transition-colors ${
                currentStep >= 2 ? 'text-[#E0B094]' : 'text-gray-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${
                currentStep === 2 
                  ? 'bg-[#E0B094] text-black border-[#E0B094]' 
                  : currentStep > 2 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="hidden sm:inline uppercase tracking-wider">2. Shipping Details</span>
            </div>

            <div className={`flex-1 h-[1px] mx-4 transition-colors ${currentStep > 2 ? 'bg-[#E0B094]' : 'bg-white/10'}`} />

            {/* Step 3 Indicator */}
            <div 
              className={`flex items-center gap-2.5 transition-colors ${
                currentStep >= 3 ? 'text-[#E0B094]' : 'text-gray-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${
                currentStep === 3 
                  ? 'bg-[#E0B094] text-black border-[#E0B094]' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                3
              </div>
              <span className="hidden sm:inline uppercase tracking-wider">3. Payment & Confirm</span>
            </div>

          </div>
        </div>

        {/* ERROR MESSAGE ALERT */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3 animate-fade-in font-medium">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* EMPTY CART CHECKOUT */}
        {cartItems.length === 0 ? (
          <div className="bg-[#12131A] border border-white/10 rounded-3xl p-12 text-center space-y-5 shadow-2xl max-w-2xl mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#E0B094] mx-auto" />
            <h2 className="font-cinzel text-2xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-[#C5C8D0]">Please add luxury jewelry selections to your cart prior to checking out.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs uppercase rounded-xl"
            >
              EXPLORE COLLECTION
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* STEP 1: PRODUCT & PRICE BREAKDOWN CONFIRMATION */}
            {currentStep === 1 && (
              <div className="lg:col-span-8 space-y-5">
                <div className="bg-[#12131A] border border-white/10 rounded-xl p-6 sm:p-7 space-y-5 shadow-xl">
                  
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-[#E0B094] uppercase tracking-widest block">
                      STEP 1 OF 3
                    </span>
                    <h2 className="font-cinzel text-xl font-bold text-white mt-1">
                      Confirm Product & Price Breakdown
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div 
                        key={item.cartItemId || item.productId}
                        className="bg-[#0C0D10] border border-white/10 rounded-xl p-4 flex items-center gap-4"
                      >
                        <div className="w-20 h-20 rounded-xl bg-[#161822] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1 text-left">
                          <span className="text-[9px] font-mono text-[#E0B094] uppercase tracking-wider block">
                            {item.categoryTitle}
                          </span>
                          <h3 className="font-serif text-sm sm:text-base font-medium text-white truncate">
                            {item.title}
                          </h3>
                          {(item.options?.purityTitle || item.options?.colorTitle) && (
                            <div className="flex items-center gap-2 text-[10px] text-[#C5C8D0]">
                              {item.options.purityTitle && <span>Purity: {item.options.purityTitle}</span>}
                              {item.options.colorTitle && <span>Color: {item.options.colorTitle}</span>}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#C5C8D0] block">Qty: {item.quantity}</span>
                          <span className="font-mono text-sm font-semibold text-[#E0B094]">
                            ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      onClick={handleStep1Submit}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.2em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] flex items-center gap-2.5 cursor-pointer"
                    >
                      <span>CONFIRM ITEMS & PROCEED TO ADDRESS</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 2: USER DATA & DETAILS CONFIRMATION */}
            {currentStep === 2 && (
              <div className="lg:col-span-8 space-y-5">
                <form onSubmit={handleStep2Submit} className="bg-[#12131A] border border-white/10 rounded-xl p-6 sm:p-7 space-y-6 shadow-xl">
                  
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-[#E0B094] uppercase tracking-widest block">
                      STEP 2 OF 3
                    </span>
                    <h2 className="font-cinzel text-xl font-bold text-white mt-1">
                      Shipping Address & Contact Details
                    </h2>
                  </div>

                  {/* Saved Addresses Selection Grid (if user has saved addresses) */}
                  {user && Array.isArray(user.addresses) && user.addresses.length > 0 && (
                    <div className="space-y-3 pb-4 border-b border-white/10">
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider flex items-center justify-between">
                        <span>Select Delivery Address ({user.addresses.length} Saved)</span>
                        <Link to="/profile" className="text-[11px] text-[#C5C8D0] hover:text-[#E0B094] underline normal-case font-normal">
                          Manage Addresses in Profile
                        </Link>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.addresses.map((addr, idx) => {
                          const addrId = addr.id || addr._id || idx;
                          const isSelected = selectedAddressId === addrId;
                          return (
                            <div
                              key={addrId}
                              onClick={() => selectSavedAddress(addr)}
                              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-[#E0B094]/10 border-[#E0B094] text-white shadow-[0_0_15px_rgba(224,176,148,0.2)]'
                                  : 'bg-[#0C0D10] border-white/10 text-[#C5C8D0] hover:border-white/25'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold text-xs text-white mb-1">
                                <span>{addr.name || 'Recipient'}</span>
                                {isSelected && (
                                  <span className="text-[10px] text-[#E0B094] font-bold tracking-wider flex items-center gap-1">
                                    <Check className="w-3 h-3" /> SELECTED
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] truncate font-light text-white/90">{addr.address}</p>
                              {addr.landmark && (
                                <p className="text-[10px] text-[#E0B094]/80 truncate">Landmark: {addr.landmark}</p>
                              )}
                              <p className="text-[10px] text-[#C5C8D0]/70 font-mono">{addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-[10px] text-[#C5C8D0]/60 font-mono pt-1">Phone: {addr.phone}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={shippingDetails.customerName}
                        onChange={handleShippingChange}
                        placeholder="e.g. Goutam Jana"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="customerPhone"
                        value={shippingDetails.customerPhone}
                        onChange={handleShippingChange}
                        onKeyDown={handleDigitKeyDown}
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={shippingDetails.customerEmail}
                        onChange={handleShippingChange}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>

                    {/* Street Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        Delivery Street Address *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress"
                        value={shippingDetails.shippingAddress}
                        onChange={handleShippingChange}
                        maxLength={100}
                        placeholder="House / Flat No, Building, Street Name"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Landmark */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        Landmark <span className="text-[#C5C8D0]/50 lowercase font-normal">(optional e.g. Near Park Metro)</span>
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={shippingDetails.landmark}
                        onChange={handleShippingChange}
                        maxLength={100}
                        placeholder="e.g. Opposite City Mall / Near Metro Station"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>

                    {/* City & State */}
                    <div>
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleShippingChange}
                        maxLength={100}
                        placeholder="Kolkata"
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        State & Pincode
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="state"
                          value={shippingDetails.state}
                          onChange={handleShippingChange}
                          maxLength={100}
                          placeholder="State"
                          className="w-2/3 bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          name="pincode"
                          value={shippingDetails.pincode}
                          onChange={handleShippingChange}
                          onKeyDown={handleDigitKeyDown}
                          maxLength={6}
                          placeholder="PIN"
                          className="w-1/3 bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-lg px-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#E0B094] uppercase tracking-wider mb-2">
                        Special Instructions / Ring Size Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        name="notes"
                        value={shippingDetails.notes}
                        onChange={handleShippingChange}
                        placeholder="Any special gift message or delivery preferences..."
                        className="w-full bg-[#0C0D10] border border-white/15 focus:border-[#E0B094] rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none resize-none"
                      />
                    </div>

                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-3 text-xs font-semibold text-[#C5C8D0] hover:text-white uppercase tracking-wider"
                    >
                      ← Back to Items
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.2em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] flex items-center gap-2.5 cursor-pointer"
                    >
                      <span>PROCEED TO PAYMENT METHOD</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD & FINAL CONFIRMATION */}
            {currentStep === 3 && (
              <div className="lg:col-span-8 space-y-5">
                <div className="bg-[#12131A] border border-white/10 rounded-xl p-6 sm:p-7 space-y-6 shadow-xl">
                  
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-[#E0B094] uppercase tracking-widest block">
                      STEP 3 OF 3
                    </span>
                    <h2 className="font-cinzel text-xl font-bold text-white mt-1">
                      Select Payment Method
                    </h2>
                  </div>

                  {/* Payment Methods Selection */}
                  <div className="space-y-4">
                    
                    {/* Razorpay Online Payment Option */}
                    <div className="p-5 rounded-xl border border-[#E0B094] bg-[#E0B094]/10 shadow-[0_0_25px_rgba(224,176,148,0.2)] flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-black border border-[#E0B094]/50 text-[#E0B094] shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                            Razorpay Secure Online Gateway
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C5C8D0] leading-relaxed font-light">
                          Supports all Credit Cards, Debit Cards, UPI (GPay, PhonePe, Paytm), NetBanking, and Wallets with 256-Bit SSL encryption.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Summary Snippet */}
                  <div className="bg-[#0C0D10] border border-white/10 rounded-xl p-4 text-xs space-y-2 font-light">
                    <div className="flex justify-between items-center text-[#C5C8D0]">
                      <span>Delivering to:</span>
                      <strong className="text-white">{shippingDetails.customerName} ({shippingDetails.customerPhone})</strong>
                    </div>
                    <div className="flex justify-between items-center text-[#C5C8D0]">
                      <span>Shipping Address:</span>
                      <span className="text-white truncate max-w-xs">{shippingDetails.shippingAddress}, {shippingDetails.city}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-3 text-xs font-semibold text-[#C5C8D0] hover:text-white uppercase tracking-wider"
                    >
                      ← Back to Address
                    </button>

                    <button
                      onClick={handleRazorpayPayment}
                      disabled={submitting}
                      className="px-6 py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs sm:text-sm tracking-wider uppercase rounded-lg hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>VERIFYING & INITIALIZING...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <span>Pay via Razorpay</span>
                          <span className="opacity-40">|</span>
                          <span className="font-mono font-bold text-sm">₹{formattedTotal}</span>
                          <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* RIGHT COLUMN: ORDER SUMMARY CARD (SPAN 4) */}
            <div className="lg:col-span-4 bg-[#12131A] border border-[#E0B094]/30 rounded-xl p-6 sm:p-7 space-y-6 shadow-2xl sticky top-28">
              
              <div className="border-b border-white/10 pb-4">
                <span className="font-poppins text-xs font-semibold tracking-[0.2em] text-[#E0B094] uppercase block">
                  ORDER SUMMARY
                </span>
                <h2 className="font-cinzel text-xl font-bold text-white mt-0.5">
                  Cost Breakdown
                </h2>
              </div>

              {/* Price Details */}
              <div className="space-y-3 text-xs text-[#C5C8D0] font-light">
                <div className="flex justify-between items-center">
                  <span>Items ({cartItems.reduce((a, b) => a + (b.quantity || 1), 0)})</span>
                  <span className="font-mono text-white font-medium">₹{formattedTotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-400 font-medium">COMPLIMENTARY</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>IGI & GIA Diamond Certification</span>
                  <span className="text-[#E0B094] font-medium">INCLUDED</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Luxury Vault Packaging</span>
                  <span className="text-[#E0B094] font-medium">INCLUDED</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-4 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Grand Total</span>
                  <span className="font-mono text-2xl font-bold text-[#E0B094]">
                    ₹{formattedTotal}
                  </span>
                </div>
                <p className="text-[10px] text-[#C5C8D0]/50 italic text-right">
                  Includes GST & fully insured transit
                </p>
              </div>

              {/* Security & Authenticity Trust Badges */}
              <div className="pt-2 border-t border-white/10 space-y-2.5 text-[11px] text-[#C5C8D0]/70 font-light">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#E0B094] shrink-0" />
                  <span>100% Certified Natural & Lab-Grown Diamonds</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#E0B094] shrink-0" />
                  <span>256-Bit Encrypted Secure Order</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#E0B094] shrink-0" />
                  <span>Lifetime Authenticity Guarantee</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MANDATORY PROFILE COMPLETENESS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="max-w-md w-full bg-[#12131A] border border-[#E0B094]/40 rounded-xl p-6 text-center space-y-5 shadow-2xl relative animate-fade-in">
            
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 text-[#E0B094]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-cinzel text-xl font-bold text-white">
                Profile Setup Required Before Payment
              </h3>
              <p className="text-xs text-[#C5C8D0] leading-relaxed font-light">
                To purchase certified diamond jewelry, government security compliance requires complete identity verification in your member profile.
              </p>
            </div>

            <div className="bg-[#0C0D10] border border-rose-500/30 rounded-xl p-4 text-left text-xs space-y-2 font-mono">
              <span className="text-[11px] text-rose-400 font-semibold uppercase block border-b border-rose-500/20 pb-1.5">
                Missing Required Profile Data:
              </span>
              {missingFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 text-rose-300">
                  <span className="text-rose-500">✕</span>
                  <span>{field}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-[#C5C8D0] hover:text-white text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  navigate('/profile');
                }}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer"
              >
                Go to Profile Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

