import React from 'react';

export default function BrandFeaturesBar() {
  const features = [
    {
      id: 'certified',
      title: 'CERTIFIED DIAMONDS',
      subtitle: '100% certified natural diamonds',
      // Diamond Facets SVG Emblem
      icon: (
        <svg className="w-9 h-9 text-[#E0B094] filter drop-shadow-[0_0_10px_rgba(224,176,148,0.4)]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Crown & Table */}
          <path d="M14 6H34L44 18L24 42L4 18L14 6Z" fill="url(#gold-fill-grad)" fillOpacity="0.15" stroke="url(#gold-stroke-grad)" />
          <path d="M14 6L20 18L24 6L28 18L34 6" stroke="url(#gold-stroke-grad)" />
          <path d="M4 18H44" stroke="url(#gold-stroke-grad)" />
          <path d="M20 18L24 42L28 18" stroke="url(#gold-stroke-grad)" />
          <path d="M14 6L4 18" stroke="url(#gold-stroke-grad)" />
          <path d="M34 6L44 18" stroke="url(#gold-stroke-grad)" />
          {/* Top Sparkle Rays */}
          <path d="M24 0V3M10 2L12 4M38 2L36 4" stroke="#F7E09A" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'craftsmanship',
      title: 'EXPERT CRAFTSMANSHIP',
      subtitle: 'Precision in every detail',
      // Rosette Medal Award Badge SVG Emblem
      icon: (
        <svg className="w-9 h-9 text-[#E0B094] filter drop-shadow-[0_0_10px_rgba(224,176,148,0.4)]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Scalloped Circle */}
          <circle cx="24" cy="20" r="14" fill="url(#gold-fill-grad)" fillOpacity="0.15" stroke="url(#gold-stroke-grad)" />
          <circle cx="24" cy="20" r="10" stroke="url(#gold-stroke-grad)" strokeDasharray="2 2" />
          {/* Center Gem/Star */}
          <path d="M24 15L25.5 18.5L29 19L26.5 21.5L27 25L24 23.2L21 25L21.5 21.5L19 19L22.5 18.5L24 15Z" fill="url(#gold-stroke-grad)" />
          {/* Ribbon Tails */}
          <path d="M18 32L14 44L20 40L24 44L22 34" stroke="url(#gold-stroke-grad)" />
          <path d="M30 32L34 44L28 40L24 44L26 34" stroke="url(#gold-stroke-grad)" />
        </svg>
      )
    },
    {
      id: 'trust',
      title: 'TRUST & TRANSPARENCY',
      subtitle: 'Honest pricing, lifelong trust',
      // Shield Crest with Checkmark SVG Emblem
      icon: (
        <svg className="w-9 h-9 text-[#E0B094] filter drop-shadow-[0_0_10px_rgba(224,176,148,0.4)]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Shield Outline */}
          <path d="M24 4L8 10V22C8 33 15 41 24 44C33 41 40 33 40 22V10L24 4Z" fill="url(#gold-fill-grad)" fillOpacity="0.15" stroke="url(#gold-stroke-grad)" />
          <path d="M24 8L12 13V22C12 30.5 17.5 37 24 39.5C30.5 37 36 30.5 36 22V13L24 8Z" opacity="0.5" stroke="url(#gold-stroke-grad)" />
          {/* Verified Checkmark */}
          <path d="M17 22L22 27L31 17" stroke="#F7E09A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'packaging',
      title: 'LUXURY PACKAGING',
      subtitle: 'Because every moment matters',
      // Gift Box Ribbon SVG Emblem
      icon: (
        <svg className="w-9 h-9 text-[#E0B094] filter drop-shadow-[0_0_10px_rgba(224,176,148,0.4)]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Box Base & Lid */}
          <rect x="8" y="20" width="32" height="22" rx="2" fill="url(#gold-fill-grad)" fillOpacity="0.15" stroke="url(#gold-stroke-grad)" />
          <rect x="6" y="14" width="36" height="7" rx="1.5" stroke="url(#gold-stroke-grad)" />
          {/* Vertical Ribbon */}
          <line x1="24" y1="14" x2="24" y2="42" stroke="url(#gold-stroke-grad)" strokeWidth="2" />
          {/* Ribbon Bow Loops */}
          <path d="M24 14C20 14 16 10 18 6C20 2 24 12 24 14Z" stroke="url(#gold-stroke-grad)" fill="url(#gold-fill-grad)" fillOpacity="0.3" />
          <path d="M24 14C28 14 32 10 30 6C28 2 24 12 24 14Z" stroke="url(#gold-stroke-grad)" fill="url(#gold-fill-grad)" fillOpacity="0.3" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative w-full bg-[#08090C] border-y border-white/10 text-[#F5F5F0] py-5 sm:py-7 px-4 sm:px-8 select-none z-20">
      
      {/* SVG Gradient Definitions */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="gold-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E09A" />
            <stop offset="50%" stopColor="#E0B094" />
            <stop offset="100%" stopColor="#C59B27" />
          </linearGradient>
          <linearGradient id="gold-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0B094" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-0">
        {features.map((item, index) => (
          <div 
            key={item.id}
            className={`flex flex-col items-center text-center px-1 sm:px-4 py-1 transition-transform duration-300 hover:-translate-y-0.5 ${
              index !== features.length - 1 ? 'border-r border-white/10' : ''
            }`}
          >
            {/* Custom Gold Vector Icon */}
            <div className="mb-1.5 sm:mb-2.5 flex items-center justify-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-black/40 border border-[#E0B094]/15 shadow-[0_0_15px_rgba(224,176,148,0.08)]">
              <div className="scale-75 sm:scale-100 flex items-center justify-center">
                {item.icon}
              </div>
            </div>

            {/* Feature Title using Cinzel Font */}
            <h3 className="font-cinzel font-semibold text-[9px] sm:text-xs lg:text-[13px] tracking-[0.05em] sm:tracking-[0.16em] text-[#E0B094] uppercase mb-0.5 sm:mb-1 leading-tight">
              {item.title}
            </h3>

            {/* Feature Subtitle */}
            <p className="font-open-sans text-[8px] sm:text-[11px] lg:text-xs text-[#9B9EA7] font-normal leading-tight sm:leading-normal max-w-[210px]">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
