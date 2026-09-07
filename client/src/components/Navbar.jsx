import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';

export default function Navbar({
  onOpenShop,
  onOpenSignup,
  onOpenAuthModal,
  user,
  onLogout,
  onNavigateToAdmin
}) {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const leftNavItems = [
    { id: 'HOME', label: 'HOME', href: '#home' },
    { id: 'COLLECTION', label: 'COLLECTION', href: '#collection' },
    { id: 'ABOUT US', label: 'ABOUT US', href: '#about' },
  ];

  const rightNavItems = [
    { id: 'SHOP', label: 'SHOP', href: '#shop' },
    { id: 'WHY DIAMORA', label: 'WHY DIAMORA', href: '#whydiamora' },
    { id: 'CONTACT', label: 'CONTACT', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tabId, href) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId === 'SHOP' && onOpenShop) {
      onOpenShop();
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 font-poppins transition-all duration-300 ${scrolled
          ? 'bg-[#0C0D10]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2 sm:py-2.5'
          : 'bg-transparent py-3 sm:py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between relative h-12">

        {/* LEFT NAV MENU (DESKTOP) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 flex-1 justify-start">
          {leftNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.id, item.href); }}
                className={`relative py-1 text-xs font-medium tracking-[0.2em] transition-colors duration-300 uppercase ${isActive ? 'text-[#E0B094]' : 'text-[#C5C8D0] hover:text-[#E0B094]'
                  }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#E0B094] shadow-[0_0_8px_rgba(224,176,148,0.6)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* CENTER LOGO (INDEPENDENT ABSOLUTE POSITIONING WITH SMOOTH SCROLL SCALE) */}
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ease-in-out ${scrolled
            ? 'top-[calc(50%+9px)] -translate-y-1/2'
            : 'top-1/2 -translate-y-[30%]'
          }`}>
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('HOME', '#home'); }}
            className="flex items-center justify-center group"
          >
            <img
              src="/diamora_logo.png"
              alt="Diamora Logo"
              className={`w-auto object-contain transition-all duration-300 ease-in-out filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${scrolled
                  ? 'h-16 sm:h-20 md:h-24 max-w-[280px] sm:max-w-[360px]'
                  : 'h-[107px] sm:h-[123px] md:h-[139px] max-w-[380px] sm:max-w-[460px]'
                }`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="font-cinzel text-lg sm:text-xl font-bold tracking-[0.25em] text-[#D4AF37] hidden uppercase">
              DIAMORA
            </span>
          </a>
        </div>

        {/* RIGHT NAV MENU & UTILITY ICONS (DESKTOP) */}
        <div className="hidden md:flex items-center justify-end flex-1 space-x-6 lg:space-x-8">

          <nav className="flex items-center space-x-6 lg:space-x-8">
            {rightNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.id, item.href); }}
                  className={`relative py-1 text-xs font-medium tracking-[0.2em] transition-colors duration-300 uppercase ${isActive ? 'text-[#E0B094]' : 'text-[#C5C8D0] hover:text-[#E0B094]'
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#E0B094] shadow-[0_0_8px_rgba(224,176,148,0.6)]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* UTILITY ICONS: Search, User, Cart */}
          <div className="flex items-center space-x-4 border-l border-white/10 pl-6 text-[#F5F5F0]">

            {/* Search Icon */}
            <button
              className="p-1.5 hover:text-[#E0B094] transition-colors focus:outline-none"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* User Account Icon */}
            {user ? (
              <div className="relative group">
                <button
                  className="p-1.5 text-[#E0B094] hover:text-white transition-colors focus:outline-none flex items-center gap-1.5 text-xs"
                  title={`Logged in as ${user.name || user.email}`}
                >
                  <User className="w-4 h-4 text-[#E0B094]" />
                  <span className="hidden lg:inline text-[11px] text-[#E0B094] font-medium max-w-[90px] truncate">
                    {user.name?.split(' ')[0] || 'Vault'}
                  </span>
                </button>

                {/* Dropdown Menu on Hover/Focus */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0C0D10]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3 hidden group-hover:block transition-all z-50">
                  <div className="px-2 py-1.5 border-b border-white/10 mb-2">
                    <p className="text-xs font-semibold text-[#F5F5F0] truncate">{user.name || 'Valued Member'}</p>
                    <p className="text-[10px] text-[#C5C8D0] truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#E0B094]/20 border border-[#E0B094]/30 text-[#E0B094] text-[9px] font-bold rounded uppercase">
                        ADMIN
                      </span>
                    )}
                  </div>

                  {user.role === 'admin' && onNavigateToAdmin && (
                    <button
                      onClick={onNavigateToAdmin}
                      className="w-full text-left px-2 py-1.5 text-xs text-[#E0B094] hover:bg-white/5 rounded-md transition-colors font-medium mb-1 flex items-center justify-between"
                    >
                      <span>Admin Dashboard</span>
                      <span>→</span>
                    </button>
                  )}

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 rounded-md transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal || onOpenSignup}
                className="p-1.5 hover:text-[#E0B094] transition-colors focus:outline-none"
                title="Account / Log In"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            {/* Shopping Bag Icon with Badge Counter */}
            <button
              onClick={onOpenShop}
              className="relative p-1.5 hover:text-[#E0B094] transition-colors focus:outline-none"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E0B094] text-[#0C0D10] text-[9px] font-extrabold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            </button>

          </div>

        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <div className="md:hidden flex items-center space-x-3">

          {/* Shopping Bag Icon Mobile */}
          <button
            onClick={onOpenShop}
            className="relative p-1.5 text-[#F5F5F0] hover:text-[#E0B094]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E0B094] text-[#0C0D10] text-[9px] font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#F5F5F0] hover:text-[#E0B094] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0D10]/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 mt-3 shadow-2xl space-y-5 animate-fadeIn">

          <div className="flex flex-col space-y-4">
            {[...leftNavItems, ...rightNavItems].map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.id, item.href); }}
                className={`text-left text-xs font-semibold tracking-[0.2em] py-2 border-b border-white/5 uppercase ${activeTab === item.id ? 'text-[#E0B094]' : 'text-[#C5C8D0]'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-white/10 text-[#F5F5F0]">
            <button
              className="flex items-center gap-2 text-xs text-[#C5C8D0] hover:text-[#E0B094]"
            >
              <Search className="w-4 h-4" />
              <span>SEARCH</span>
            </button>
            {user ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"
              >
                <User className="w-4 h-4" />
                <span>LOGOUT ({user.name?.split(' ')[0] || 'USER'})</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal || onOpenSignup}
                className="flex items-center gap-2 text-xs text-[#C5C8D0] hover:text-[#E0B094]"
              >
                <User className="w-4 h-4" />
                <span>ACCOUNT</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
