import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Footer({ onOpenTickets }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#08090C] text-[#C5C8D4] pt-14 pb-8 px-4 sm:px-8 lg:px-12 select-none z-20 overflow-hidden">
      
      {/* Decorative Hairline Grid Background */}
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* 5-COLUMN MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 pb-12 border-b border-white/10">
          
          {/* COLUMN 1: BRAND LOGO, BIO & SOCIALS (SPAN 3) */}
          <div className="lg:col-span-3 space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/diamora_logo.png" 
                alt="Diamora Logo" 
                className="h-20 sm:h-24 md:h-28 w-auto object-contain" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center">
                <span className="text-xl font-bold tracking-[0.22em] text-[#E0B094]">
                  DIAMORA
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#808490] uppercase">
                  DIAMOND JEWELLERY
                </span>
              </div>
            </div>

            {/* Bio Paragraph */}
            <p className="text-xs text-[#9094A0] leading-relaxed max-w-xs">
              Diamora is a promise of forever. Exquisite diamonds crafted for life&apos;s most precious moments.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-[#C5C8D4] pt-1">
              {/* Instagram */}
              <a href="#" className="hover:text-[#E0B094] transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a href="#" className="hover:text-[#E0B094] transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>

              {/* Pinterest */}
              <a href="#" className="hover:text-[#E0B094] transition-colors" aria-label="Pinterest">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="#" className="hover:text-[#E0B094] transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS (SPAN 2) */}
          <div className="lg:col-span-2 space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h4 className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9094A0]">
              <li><Link to="/about" className="hover:text-[#E0B094] transition-colors">About Us</Link></li>
              <li><a href="/#collection" className="hover:text-[#E0B094] transition-colors">Collection</a></li>
              <li><Link to="/shop" className="hover:text-[#E0B094] transition-colors">Shop</Link></li>
              <li><a href="/#whydiamora" className="hover:text-[#E0B094] transition-colors">Why Diamora</a></li>
              <li><a href="/#contact" className="hover:text-[#E0B094] transition-colors">Contact Us</a></li>
              <li><a href="/#contact" className="hover:text-[#E0B094] transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* COLUMN 3: CUSTOMER SERVICE (SPAN 2) */}
          <div className="lg:col-span-2 space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h4 className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
              CUSTOMER SERVICE
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9094A0]">
              <li><a href="#" className="hover:text-[#E0B094] transition-colors">Ring Size Guide</a></li>
              <li><a href="#" className="hover:text-[#E0B094] transition-colors">Care Instructions</a></li>
              <li><a href="#" className="hover:text-[#E0B094] transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-[#E0B094] transition-colors">Returns & Exchanges</a></li>
              <li><Link to="/terms-conditions" className="hover:text-[#E0B094] transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#E0B094] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: CERTIFICATION (SPAN 2) */}
          <div className="lg:col-span-2 flex flex-col items-center text-center space-y-3">
            <h4 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-1">
              CERTIFICATION
            </h4>
            
            {/* Ornamental Gold Certified Crest Seal Emblem */}
            <div className="w-16 h-16 relative flex items-center justify-center my-1 drop-shadow-[0_0_12px_rgba(224,176,148,0.25)]">
              <svg className="w-full h-full text-[#E0B094]" viewBox="0 0 100 100" fill="none">
                {/* Outer Dashed Wreath Border */}
                <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" opacity="0.9" />
                <circle cx="50" cy="50" r="38" fill="rgba(224, 176, 148, 0.06)" stroke="currentColor" strokeWidth="0.8" />
                {/* Inner Shield / Diamond Facets */}
                <path d="M50 20 L66 33 L66 57 L50 78 L34 57 L34 33 Z" stroke="currentColor" strokeWidth="1.2" fill="rgba(224, 176, 148, 0.1)" />
                <path d="M50 26 L60 35 L50 48 L40 35 Z" fill="currentColor" opacity="0.85" />
                <path d="M50 48 L60 35 L50 68 L40 35 Z" fill="currentColor" opacity="0.45" />
                {/* Laurel Leaves Bottom Arc */}
                <path d="M28 50 C28 65 38 75 50 75 C62 75 72 65 72 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>

            {/* Subtext */}
            <p className="text-xs text-[#B0B4C0] leading-relaxed max-w-[170px]">
              All our diamonds are<br />
              <span className="font-semibold text-white">IGI Certified</span>
            </p>

            {/* Official IGI Logo Emblem (Icon + Bold Text + 3-line Stack) */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[#E0B094]">
              {/* IGI Globe/Fingerprint Logo Symbol */}
              <div className="w-7 h-7 rounded-full border border-[#E0B094]/60 flex items-center justify-center p-1 bg-[#E0B094]/10 shrink-0">
                <svg className="w-full h-full text-[#E0B094]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2A10 10 0 1022 12 10.011 10.011 0 0012 2zm0 18a8 8 0 118-8 8.009 8.009 0 01-8 8z" />
                  <path d="M12 6a6 6 0 00-4.24 10.24l1.41-1.41A4 4 0 1116 12h2a6 6 0 00-6-6z" />
                </svg>
              </div>

              {/* Bold IGI Wordmark */}
              <span className="text-xl font-extrabold tracking-widest text-[#E0B094] uppercase leading-none">
                IGI
              </span>

              {/* 3-Line Stacked Department Title */}
              <div className="flex flex-col text-[7px] leading-[8.5px] tracking-wider text-[#A0A4B2] uppercase font-bold border-l border-white/20 pl-2 text-left">
                <span>INTERNATIONAL</span>
                <span>GEMOLOGICAL</span>
                <span>INSTITUTE</span>
              </div>
            </div>
          </div>

          {/* COLUMN 5: NEWSLETTER (SPAN 3) */}
          <div className="lg:col-span-3 space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h4 className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
              NEWSLETTER
            </h4>

            <p className="text-xs text-[#9094A0] leading-relaxed">
              Subscribe to get updates on our latest collections and offers.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-sm">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-[#E0B094]/30 bg-[#12131A] text-white text-xs placeholder:text-[#606470] focus:outline-none focus:border-[#E0B094]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#181924] border border-[#E0B094]/40 text-[#E0B094] hover:bg-[#E0B094] hover:text-black transition-all duration-300"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="p-3 rounded-lg border border-[#E0B094]/40 bg-[#E0B094]/10 text-xs text-[#E0B094]">
                ✓ Thank you for subscribing!
              </div>
            )}
          </div>

        </div>

        {/* BOTTOM BAR (COPYRIGHT & PAYMENT BADGES) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#707480] gap-4">
          <span>© 2026 Diamora Diamond Jewellery. All Rights Reserved.</span>

          {/* Payment Badges (VISA, Mastercard, AMEX, UPI) */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#14151D] border border-white/10 text-[10px] font-bold text-white tracking-widest uppercase">
              VISA
            </span>
            <span className="px-2.5 py-1 rounded bg-[#14151D] border border-white/10 text-[10px] font-bold text-amber-400 tracking-widest uppercase">
              MC
            </span>
            <span className="px-2.5 py-1 rounded bg-[#14151D] border border-white/10 text-[10px] font-bold text-blue-400 tracking-widest uppercase">
              AMEX
            </span>
            <span className="px-2.5 py-1 rounded bg-[#14151D] border border-white/10 text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
              UPI
            </span>
          </div>
        </div>

      </div>

    </footer>
  );
}
