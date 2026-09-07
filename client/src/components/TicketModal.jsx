import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, Diamond, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TicketModal({ isOpen, onClose }) {
  const [selectedTier, setSelectedTier] = useState('viewing');
  const [guestCount, setGuestCount] = useState(2);
  const [visitDate, setVisitDate] = useState('2026-09-20');
  const [timeSlot, setTimeSlot] = useState('02:00 PM');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'viewing',
      name: 'Private Salon Viewing',
      price: 'Complimentary',
      features: ['Personal gemologist host', 'The Eternal Solitaire viewing', 'Champagne reception']
    },
    {
      id: 'custom',
      name: 'Custom Bespoke Consultation',
      price: 'Complimentary',
      features: ['Master jeweler design session', 'Loose D-Flawless stone selection', '3D CAD ring rendering']
    },
    {
      id: 'vault',
      name: 'VIP High-Jewelry Vault Access',
      price: 'By Invitation',
      features: ['Private Place Vendôme vault access', 'Archival museum piece inspection', 'Curator concierge escort']
    }
  ];

  const currentTier = tiers.find(t => t.id === selectedTier);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
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
  };

  const handleReset = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#121214] p-6 sm:p-10 shadow-2xl text-[#F5F5F0] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-[#9B9B9B] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmed ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#3B6EF5] tracking-[0.3em] uppercase mb-2">
              <Calendar className="w-4 h-4" />
              <span>PRIVATE SALON RESERVATION</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-light text-white mb-6">
              Book a Private <span className="italic text-[#3B6EF5] font-normal">Consultation</span>
            </h3>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Select Tier */}
              <div>
                <label className="text-xs font-mono tracking-widest text-[#9B9B9B] uppercase block mb-3">
                  1. SELECT SALON EXPERIENCE
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tiers.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                        selectedTier === t.id
                          ? 'border-[#3B6EF5] bg-[#3B6EF5]/15 shadow-[0_0_15px_rgba(59,110,245,0.3)]'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-1">{t.name}</div>
                      <div className="font-mono text-xs font-bold text-[#3B6EF5]">{t.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono tracking-widest text-[#9B9B9B] uppercase block mb-2">
                    2. APPOINTMENT DATE
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono text-xs focus:outline-none focus:border-[#3B6EF5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono tracking-widest text-[#9B9B9B] uppercase block mb-2">
                    3. PREFERRED TIME SLOT
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#121214] text-white font-mono text-xs focus:outline-none focus:border-[#3B6EF5]"
                  >
                    <option>11:00 AM — Morning Salon</option>
                    <option>02:00 PM — Afternoon Salon</option>
                    <option>04:30 PM — Tea & Viewing</option>
                    <option>07:00 PM — Evening Nocturne</option>
                  </select>
                </div>
              </div>

              {/* Guests Count */}
              <div>
                <label className="text-xs font-mono tracking-widest text-[#9B9B9B] uppercase block mb-2">
                  4. NUMBER OF GUESTS
                </label>
                <div className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 w-fit">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-white px-4">{guestCount} GUESTS</span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#9B9B9B] uppercase block">LOCATION</span>
                  <span className="font-serif text-sm font-semibold text-white">Place Vendôme, Paris</span>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#3B6EF5] hover:bg-[#2A57D8] text-white font-semibold text-xs tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(59,110,245,0.5)] transition-all"
                >
                  CONFIRM SALON RESERVATION
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Pass Card */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#3B6EF5]/20 border border-[#3B6EF5] flex items-center justify-center mx-auto text-[#3B6EF5]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#3B6EF5] tracking-[0.3em] uppercase block mb-1">
                SALON APPOINTMENT CONFIRMED
              </span>
              <h3 className="font-serif text-3xl font-normal text-white">
                Welcome to Maison Luxe
              </h3>
            </div>

            <div className="p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md max-w-md mx-auto text-left space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[#3B6EF5] font-bold">MAISON LUXE SALON PASS</span>
                <span className="text-[#9B9B9B]">#LX-2026-9901</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-[#9B9B9B] uppercase block">EXPERIENCE</span>
                  <span className="font-bold text-white uppercase">{currentTier?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#9B9B9B] uppercase block">PARTY SIZE</span>
                  <span className="font-bold text-white">{guestCount} GUESTS</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#9B9B9B] uppercase block">DATE</span>
                  <span className="font-bold text-white">{visitDate}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#9B9B9B] uppercase block">TIME</span>
                  <span className="font-bold text-white">{timeSlot}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-[#9B9B9B]">
                  <QrCode className="w-8 h-8 text-white" />
                  <span>PRESENT PASS AT PLACE VENDÔME ENTRANCE</span>
                </div>
                <span className="font-serif text-xs font-bold text-[#3B6EF5]">CONFIRMED</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-full border border-white/20 hover:border-white text-white text-xs font-semibold tracking-widest uppercase transition-colors"
            >
              CLOSE RESERVATION
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
