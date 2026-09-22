import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, ShoppingBag, Globe, Share2, MessageCircle, Send } from 'lucide-react';

export default function HeroSectionUI({ onOpenShop, onOpenSignup }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [mobileSlide, setMobileSlide] = useState(0);

  const heroImages = [
    '/images/img1.png',
    '/images/img3.png',
    '/images/img4.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  const handleExploreCollection = (e) => {
    if (e) e.preventDefault();
    const collectionSection = document.getElementById('collection');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = ['HOME', 'FEATURES', 'BLOG', 'HANDMADE', 'AUTHOR', 'SHOP'];

  return (
    <div className="open-sans relative w-full min-h-0 lg:h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C1A16] via-[#0C0D10] to-[#0C0D10] text-[#F5F5F0] overflow-hidden flex flex-col justify-start lg:justify-between select-none">



      {/* SCREEN-WIDE THEATRICAL STAGE SPOTLIGHT BEAM & FLOOR LIGHT POOL (Refined, Non-Intrusive Luxury Lighting) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">

        {/* 1. Subtle, Compact Top-Right Stage Light Emitter Glow (Does not wash out Navbar icons) */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-white/40 via-[#eaf2ff]/20 to-transparent blur-[16px] opacity-70" />

        {/* Crisp, Refined Volumetric Diagonal Light Beam Cone (Desktop) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 sm:opacity-60 hidden sm:block"
          viewBox="0 0 1200 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="screenBeamGrad" x1="1180" y1="0" x2="680" y2="820" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
              <stop offset="25%" stopColor="#E0ECFC" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#C2D8FC" stopOpacity="0.08" />
              <stop offset="90%" stopColor="#A8C8F8" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="screenCoreGrad" x1="1180" y1="0" x2="780" y2="800" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="30%" stopColor="#F0F5FF" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#D2E4FF" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <filter id="desktopBeamFeatherBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="desktopCoreFeatherBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <polygon points="1190,0 1120,0 440,900 1190,900" fill="url(#screenBeamGrad)" filter="url(#desktopBeamFeatherBlur)" />
          <polygon points="1190,0 1145,0 620,880 1060,880" fill="url(#screenCoreGrad)" filter="url(#desktopCoreFeatherBlur)" />
        </svg>

        {/* Volumetric Diagonal Light Beam Cone (Mobile) */}
        <svg
          className="absolute top-0 left-0 w-full h-[55%] pointer-events-none opacity-30 sm:hidden block"
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mobileBeamGrad" x1="400" y1="0" x2="200" y2="450" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
              <stop offset="25%" stopColor="#E0ECFC" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mobileCoreGrad" x1="400" y1="0" x2="250" y2="420" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="30%" stopColor="#F0F5FF" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <filter id="mobileBeamFeatherBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="20" />
            </filter>
            <filter id="mobileCoreFeatherBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <polygon points="400,0 350,0 100,500 400,500" fill="url(#mobileBeamGrad)" filter="url(#mobileBeamFeatherBlur)" />
          <polygon points="400,0 380,0 150,480 320,480" fill="url(#mobileCoreGrad)" filter="url(#mobileCoreFeatherBlur)" />
        </svg>

      </div>



      {/* TOP NAVBAR OFFSET SPACER (~64px) */}
      <div className="h-14 sm:h-16 shrink-0 pointer-events-none hidden sm:block" />

      {/* HERO MAIN CONTENT SECTION (PERFECTLY CENTERED IN REMAINING VIEWPORT) */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-2 pb-6 lg:py-1">

        {/* Left Side Content (Span 6 on desktop, order 2 on mobile) */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-3.5 max-w-xl mx-auto lg:mx-0 order-2 lg:order-1 -mt-16 sm:mt-0 relative z-20">

          {/* Eyebrow Header */}
          <span className="font-poppins text-xs sm:text-sm font-medium tracking-[0.28em] text-[#E0B094] uppercase">
            NOT JUST A JEWEL,
          </span>

          {/* Main Headline */}
          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] sm:leading-[1.08] tracking-[0.08em]">
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
          <p className="font-open-sans text-xs sm:text-base text-[#B0B3BC] leading-relaxed max-w-md font-normal">
            Exquisite solitaire diamonds crafted with precision. Made for life&apos;s most precious moments.
          </p>

          {/* CTA Button */}
          <div className="pt-2 flex items-center justify-center lg:justify-start">
            <button
              onClick={handleExploreCollection}
              className="group font-poppins px-7 py-3.5 border border-[#E0B094]/70 hover:border-[#E0B094] bg-black/40 hover:bg-[#E0B094]/10 text-[#E0B094] font-semibold text-xs tracking-[0.22em] uppercase transition-all duration-300 flex items-center gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] shrink-0 w-fit cursor-pointer"
            >
              <span>EXPLORE COLLECTION</span>
              <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>

        {/* Right Side Content (Span 6 on desktop, order 1 on mobile) — IMAGE SLIDER */}
        <div className="lg:col-span-6 relative flex items-center justify-center h-auto sm:h-[480px] lg:h-[680px] transform-gpu order-1 lg:order-2 mt-12 sm:mt-0 lg:-mt-4 xl:-mt-6 overflow-hidden">

          {/* Image Frame Slider (All Screens) */}
          <div className="relative w-full h-[380px] sm:h-full flex justify-center items-end z-10 group" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}>

            {/* Sliding Image Wrapper (Mobile Only) */}
            <div
              className="absolute inset-0 flex h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] sm:hidden"
              style={{ 
                width: `${heroImages.length * 100}%`,
                transform: `translateX(-${(mobileSlide * 100) / heroImages.length}%)` 
              }}
            >
              {heroImages.map((src, idx) => (
                <div key={idx} className="relative w-full h-full flex-shrink-0 flex-1">
                  <img
                    src={src}
                    alt={`Diamoras Model ${idx + 1}`}
                    className="w-full h-full object-cover sm:object-contain object-[center_top]"
                  />
                </div>
              ))}
            </div>

            {/* Fading Image Wrapper (Desktop Only) */}
            <div className="absolute inset-0 hidden sm:block">
              {heroImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Diamoras Model ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover sm:object-contain object-[center_top] transition-all duration-1000 ease-in-out origin-center ${mobileSlide === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                    }`}
                />
              ))}
            </div>

          </div>

        </div>

      </main>

      {/* BOTTOM BAR (WITH CLEAN BOTTOM GAP ABOVE NEXT SECTION) */}
      <footer className="relative lg:absolute lg:bottom-0 lg:left-0 lg:right-0 z-30 max-w-7xl w-full mx-auto px-6 sm:px-12 pt-1 pb-10 sm:pb-6 shrink-0 flex items-center justify-between text-[#808490]">
        <div className="flex items-center space-x-6 text-white/80">
          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="Twitter">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
            </svg>
          </a>

          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="LinkedIn">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="Facebook">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          <a href="#" className="hover:text-[#D4AF37] transition-colors" title="Instagram">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </footer>

    </div>
  );
}
