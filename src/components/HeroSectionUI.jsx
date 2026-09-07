import React, { useState } from 'react';
import { ChevronRight, Sparkles, ShoppingBag, Globe, Share2, MessageCircle, Send } from 'lucide-react';
import Ring3DCanvas from './Ring3DCanvas';

export default function HeroSectionUI({ onOpenShop, onOpenSignup }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  const navLinks = ['HOME', 'FEATURES', 'BLOG', 'HANDMADE', 'AUTHOR', 'SHOP'];

  // Hotspots on 3D Ring
  const hotspots = [
    {
      id: 'solitaire',
      top: '32%',
      left: '48%',
      title: '4.20 Ct Oval Cut Diamond',
      description: 'D-Flawless Type IIa natural diamond set in 18K solid yellow gold.'
    },
    {
      id: 'shank',
      top: '62%',
      left: '60%',
      title: 'Handcrafted 18K Yellow Gold',
      description: 'Forged with comfort-fit inner shank and precision hand-burnished finish.'
    }
  ];

  return (
    <div className="open-sans relative w-full min-h-screen lg:h-screen bg-[#0C0D10] text-[#F5F5F0] overflow-hidden flex flex-col justify-between select-none">
      
      {/* Background Hairline Gridlines */}
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-25 z-0" />

      {/* Decorative Organic Layered Background Wavy Artwork */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Layered Dark Charcoal/Black Wavy Shapes */}
        <svg 
          className="absolute right-0 bottom-0 w-full lg:w-[65%] h-full text-[#14161C] opacity-90 preserve-3d" 
          viewBox="0 0 1000 1000" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path d="M400 1000C600 850 700 650 650 450C600 250 800 100 1000 0V1000H400Z" fill="#13151A" />
          <path d="M520 1000C680 880 780 720 740 520C700 320 850 150 1000 50V1000H520Z" fill="#181B22" />
          <path d="M640 1000C780 900 880 780 840 600C800 420 900 280 1000 180V1000H640Z" fill="#1F232D" />
        </svg>

        {/* Thin Gold Line-Art Leaf Illustrations */}
        <svg 
          className="absolute right-0 bottom-0 w-[450px] lg:w-[650px] h-[500px] lg:h-[700px] opacity-40" 
          viewBox="0 0 500 500" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="1.2"
        >
          <path d="M350 480C320 400 380 320 450 280C420 340 400 420 350 480Z" fill="rgba(212,175,55,0.08)" />
          <path d="M350 480L450 280M370 430L410 420M390 380L430 360M410 330L440 310" />
          
          <path d="M250 490C220 410 270 340 350 300C310 360 290 430 250 490Z" fill="rgba(212,175,55,0.05)" />
          <path d="M250 490L350 300M270 450L310 440M290 400L330 380" />

          <path d="M420 350C460 280 430 200 480 120C450 180 440 260 420 350Z" fill="rgba(212,175,55,0.06)" />
          <path d="M420 350L480 120M430 300L460 280M440 240L470 220" />
        </svg>

      {/* Small Scattered Gold Dots */}
        <div className="absolute right-12 bottom-16 lg:right-36 lg:bottom-28 flex flex-col gap-6 opacity-75">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          <span className="w-1 h-1 rounded-full bg-[#C59B27] ml-8" />
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] -ml-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] ml-12" />
        </div>
      </div>

      {/* SCREEN-WIDE THEATRICAL STAGE SPOTLIGHT BEAM & FLOOR LIGHT POOL (Refined, Non-Intrusive Luxury Lighting) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        
        {/* 1. Subtle, Compact Top-Right Stage Light Emitter Glow (Does not wash out Navbar icons) */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-white/40 via-[#eaf2ff]/20 to-transparent blur-[16px] opacity-70" />

        {/* 2. Crisp, Refined Volumetric Diagonal Light Beam Cone targeting the 3D Ring */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 sm:opacity-60"
          viewBox="0 0 1200 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Broad Controlled Volumetric Beam Gradient */}
            <linearGradient id="screenBeamGrad" x1="1180" y1="0" x2="680" y2="820" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
              <stop offset="25%" stopColor="#E0ECFC" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#C2D8FC" stopOpacity="0.08" />
              <stop offset="90%" stopColor="#A8C8F8" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Core Direct Spotlight Beam Gradient */}
            <linearGradient id="screenCoreGrad" x1="1180" y1="0" x2="780" y2="800" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="30%" stopColor="#F0F5FF" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#D2E4FF" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Controlled Feather Blur Filter */}
            <filter id="beamFeatherBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="coreFeatherBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Broad Volumetric Cone */}
          <polygon points="1190,0 1120,0 440,900 1190,900" fill="url(#screenBeamGrad)" filter="url(#beamFeatherBlur)" />

          {/* Core Spotlight Beam hitting the 3D Ring */}
          <polygon points="1190,0 1145,0 620,880 1060,880" fill="url(#screenCoreGrad)" filter="url(#coreFeatherBlur)" />
        </svg>

        {/* 3. Luminous Elliptical Stage Light Pool / Floor Highlight Blur beneath the 3D Ring (Centered under Ring Base) */}
        <div className="absolute bottom-3 sm:bottom-6 lg:bottom-7 right-[8%] sm:right-[11%] lg:right-[13%] w-[380px] sm:w-[480px] lg:w-[540px] h-[75px] sm:h-[95px] rounded-[100%] bg-gradient-to-r from-transparent via-[#dbe8fc]/25 to-transparent blur-[24px]" />
        <div className="absolute bottom-5 sm:bottom-9 lg:bottom-10 right-[13%] sm:right-[16%] lg:right-[18%] w-[200px] sm:w-[260px] lg:w-[320px] h-[30px] sm:h-[42px] rounded-[100%] bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[12px]" />
      </div>

      {/* FLOATING 3D SPHERES (Proportionally Scaled +12-15%, Hardware Accelerated) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden transform-gpu">
        <div className="absolute top-[36%] right-[27%] lg:right-[31%] animate-float-2 transform-gpu">
          <div className="w-24 h-24 lg:w-35 lg:h-35 rounded-full bg-gradient-to-br from-[#4a5060] via-[#22252e] to-[#0a0b0e] shadow-[15px_24px_40px_rgba(0,0,0,0.9),inset_-7px_-7px_14px_rgba(0,0,0,0.95),inset_7px_7px_14px_rgba(255,255,255,0.25)]" />
        </div>

        <div className="absolute bottom-[26%] right-[15%] lg:right-[19%] animate-float-3 transform-gpu">
          <div className="w-12 h-12 lg:w-18 lg:h-18 rounded-full bg-gradient-to-br from-[#f5d77f] via-[#c59b27] to-[#5c4409] shadow-[10px_14px_28px_rgba(0,0,0,0.7),inset_-4px_-4px_10px_rgba(0,0,0,0.8),inset_4px_4px_10px_rgba(255,255,255,0.6)]" />
        </div>
      </div>

      {/* TOP NAVBAR OFFSET SPACER (~64px) */}
      <div className="h-14 sm:h-16 shrink-0 pointer-events-none" />

      {/* HERO MAIN CONTENT SECTION (PERFECTLY CENTERED IN REMAINING VIEWPORT) */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-1 pb-1">
        
        {/* Left Side Content (Span 6) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-3.5 max-w-xl">
          
          {/* Eyebrow Header */}
          <span className="font-poppins text-xs sm:text-sm font-medium tracking-[0.28em] text-[#E0B094] uppercase">
            NOT JUST A JEWEL,
          </span>

          {/* Main Headline */}
          <h1 className="font-cinzel text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-[0.08em]">
            <span className="block drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]"><span className="text-white">A</span> <span className="bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] bg-clip-text text-transparent">PROMISE</span></span>
            <span className="text-white block">FOREVER</span>
          </h1>

          {/* Elegant Line Divider with Center Luxury Sparkle Star */}
          <div className="flex items-center gap-3.5 w-48 py-1">
            <div className="h-[1px] bg-gradient-to-r from-[#E0B094]/70 to-[#E0B094]/20 flex-1" />
            <svg className="w-3.5 h-3.5 text-[#E0B094] fill-current shrink-0 opacity-95 drop-shadow-[0_0_6px_rgba(224,176,148,0.5)]" viewBox="0 0 24 24">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <div className="h-[1px] bg-gradient-to-l from-[#E0B094]/70 to-[#E0B094]/20 flex-1" />
          </div>

          {/* Description Subtext */}
          <p className="font-open-sans text-sm sm:text-base text-[#B0B3BC] leading-relaxed max-w-md font-normal">
            Exquisite solitaire diamonds crafted with precision. Made for life&apos;s most precious moments.
          </p>

          {/* CTA Button */}
          <div className="pt-1 flex items-center">
            <button
              onClick={onOpenShop}
              className="group font-poppins px-7 py-3.5 border border-[#E0B094]/70 hover:border-[#E0B094] bg-black/40 hover:bg-[#E0B094]/10 text-[#E0B094] font-semibold text-xs tracking-[0.22em] uppercase transition-all duration-300 flex items-center gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] shrink-0 w-fit"
            >
              <span>EXPLORE COLLECTION</span>
              <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>

        {/* Right Side Content (Span 6) — REAL 3D GOLD RING & JEWELLERY FRAME */}
        <div className="lg:col-span-6 relative flex items-center justify-center h-[390px] sm:h-[490px] lg:h-[570px] transform-gpu">
          
          {/* Ambient Glow Halo Ring Backdrop behind 3D Model (+12-15% Scaled) */}
          <div className="absolute w-[350px] sm:w-[450px] lg:w-[520px] h-[350px] sm:h-[450px] lg:h-[520px] rounded-full bg-gradient-to-tr from-[#D4AF37]/10 via-[#F7E09A]/8 to-transparent blur-[70px] pointer-events-none z-0 animate-pulse transform-gpu" />

          {/* 3D Canvas Frame — Proportionally enlarged (+12-15%) */}
          <div className="relative z-10 w-[430px] sm:w-[540px] lg:w-[610px] h-[430px] sm:h-[540px] lg:h-[610px] transform-gpu">
            <Ring3DCanvas activeId="public_ring_model" />

            {/* Pulsing Hotspot Dots */}
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                style={{ top: spot.top, left: spot.left }}
                className="absolute z-20 opacity-0 pointer-events-none"
              >
                <button
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  className="group relative flex items-center justify-center p-2 focus:outline-none"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37]/80 border-2 border-white animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] border border-white shadow-[0_0_10px_#D4AF37]" />
                </button>

                {activeHotspot === spot.id && (
                  <div className="absolute left-6 top-0 w-52 glass-panel p-3 rounded-xl border border-[#D4AF37]/40 z-30 shadow-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase">HANDMADE DETAILS</span>
                      <button onClick={() => setActiveHotspot(null)} className="text-white/60 hover:text-white text-xs">✕</button>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{spot.title}</h4>
                    <p className="text-[10px] text-[#9B9EA7] leading-normal">{spot.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </main>

      {/* BOTTOM BAR (WITH CLEAN BOTTOM GAP ABOVE NEXT SECTION) */}
      <footer className="relative z-30 max-w-7xl w-full mx-auto px-6 sm:px-12 pt-1 pb-6 shrink-0 flex items-center justify-between text-[#808490]">
        <div className="flex items-center space-x-6 text-white/80">
          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="Twitter">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
            </svg>
          </a>

          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="LinkedIn">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="Facebook">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="Instagram">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </footer>

    </div>
  );
}
