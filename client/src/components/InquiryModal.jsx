import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Mail, MessageSquare, CheckCircle2, Sparkles, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axios';

export default function InquiryModal({ isOpen, onClose, product }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setErrorMessage('');
      setSubmittedOrder(null);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) setCustomerName(parsed.name);
          if (parsed.phone) setCustomerPhone(parsed.phone);
          if (parsed.email) setCustomerEmail(parsed.email);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  // Derive product image URL
  const productImage = 
    product?.media?.[0]?.url || 
    product?.imageUrl || 
    product?.primaryImage || 
    product?.images?.[0] || 
    '';

  const productPriceDisplay = product?.price || product?.sellingPrice || product?.mrp || '';

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide both your Name and Phone Number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      notes: notes.trim(),
      productId: product?.id || product?._id || '',
      productTitle: product?.title || product?.name || 'General Inquiry',
      productSku: product?.sku || '',
      productPrice: productPriceDisplay ? String(productPriceDisplay) : '',
      productImage: productImage,
      selectedMetal: product?.selectedMetal || product?.metalType || '',
      selectedColor: product?.selectedColor || product?.metalColor || ''
    };

    try {
      const res = await api.post('/api/orders', payload);
      if (res.data?.success) {
        setSubmittedOrder(res.data.data);
        setConfirmed(true);
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (err) {
          // fallback
        }
      } else {
        setErrorMessage(res.data?.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error submitting inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl font-poppins">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#121214] p-6 sm:p-8 shadow-2xl text-[#F5F5F0] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!confirmed ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#E0B094] tracking-[0.25em] uppercase mb-1.5">
              <Sparkles className="w-4 h-4 text-[#E0B094]" />
              <span>PRODUCT INQUIRY / ORDER</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-light text-white mb-4">
              Request <span className="italic text-[#E0B094] font-normal">Consultation</span>
            </h3>

            {/* PRODUCT PREVIEW CARD (If product passed) */}
            {product && (
              <div className="mb-5 p-3.5 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3.5">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={product.title}
                    className="w-16 h-16 rounded-xl object-cover border border-white/15 shrink-0 bg-white/5"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-gray-400 shrink-0">
                    <ShoppingBag className="w-6 h-6 text-[#E0B094]" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <span className="text-[9.5px] font-mono text-[#E0B094] tracking-widest uppercase block truncate">
                    SKU: {product.sku || 'N/A'}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-white truncate">
                    {product.title || product.name || 'Selected Jewelry'}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    {productPriceDisplay && (
                      <span className="font-mono text-[#E0B094] font-bold">
                        ₹{Number(productPriceDisplay).toLocaleString('en-IN')}
                      </span>
                    )}
                    {product.selectedMetal && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[9.5px]">
                        {product.selectedMetal}
                      </span>
                    )}
                    {product.selectedColor && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[9.5px]">
                        {product.selectedColor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1.5">
                  YOUR FULL NAME <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-sans text-xs focus:outline-none focus:border-[#E0B094] transition-colors placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1.5">
                  PHONE NUMBER <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-sans text-xs focus:outline-none focus:border-[#E0B094] transition-colors placeholder-gray-500 font-mono"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1.5">
                  EMAIL ADDRESS (OPTIONAL)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your.name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-sans text-xs focus:outline-none focus:border-[#E0B094] transition-colors placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Special Note / Customization Request */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1.5">
                  NOTES / SPECIAL REQUEST (OPTIONAL)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    rows={2}
                    placeholder="Mention custom ring size, preferred call back time, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-sans text-xs focus:outline-none focus:border-[#E0B094] transition-colors placeholder-gray-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E0B094] to-[#D4AF37] hover:from-[#d5a082] hover:to-[#c49f2c] text-slate-950 font-bold text-xs tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(224,176,148,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'SUBMITTING INQUIRY...' : 'SUBMIT INQUIRY / ORDER'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Success Card */
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#E0B094]/20 border border-[#E0B094] flex items-center justify-center mx-auto text-[#E0B094]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#E0B094] tracking-[0.25em] uppercase block mb-1">
                INQUIRY SUBMITTED SUCCESSFULLY
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Thank You, <span className="italic text-[#E0B094] font-normal">{customerName}</span>
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1.5">
                Our luxury jewelry concierge has received your enquiry order and will reach out to you shortly at <span className="text-white font-mono">{customerPhone}</span>.
              </p>
            </div>

            {/* Pass details */}
            <div className="p-4 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <span className="text-[#E0B094] font-bold">DIAMORA INQUIRY ORDER</span>
                <span className="text-gray-400">#{submittedOrder?.id?.slice(0, 8).toUpperCase() || 'REF-2026'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">CUSTOMER</span>
                  <span className="font-bold text-white uppercase">{customerName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">PHONE</span>
                  <span className="font-bold text-white">{customerPhone}</span>
                </div>
                {product && (
                  <div className="col-span-2 pt-1 border-t border-white/5">
                    <span className="text-[9px] text-gray-400 uppercase block">INQUIRED PRODUCT</span>
                    <span className="font-bold text-white truncate block">{product.title || product.name}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-8 py-3 rounded-full border border-white/20 hover:border-white text-white text-xs font-semibold tracking-widest uppercase transition-colors"
            >
              CLOSE
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
