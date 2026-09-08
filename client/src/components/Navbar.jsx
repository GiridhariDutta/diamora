import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, Award, ShieldCheck, Sparkles, Gem } from 'lucide-react';
import api from '../api/axios';

export default function Navbar({
  onOpenShop,
  onOpenSignup,
  onOpenAuthModal,
  user,
  onLogout,
  onNavigateToAdmin
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Mega Menu Hover State
  const [isShopHovered, setIsShopHovered] = useState(false);
  const hoverTimerRef = useRef(null);

  const isHomePage = location.pathname === '/';
  const isCompact = scrolled || isShopHovered || !isHomePage;

  // Dynamic Categories & Collections from Backend API
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loadingNav, setLoadingNav] = useState(true);

  const leftNavItems = [
    { id: 'HOME', label: 'HOME', href: '/', isRoute: true },
    { id: 'COLLECTION', label: 'COLLECTION', href: '#collection', isRoute: false },
    { id: 'ABOUT US', label: 'ABOUT US', href: '/about', isRoute: true },
  ];

  const rightNavItems = [
    { id: 'SHOP', label: 'SHOP', href: '/shop', isRoute: true },
    { id: 'WHY DIAMORA', label: 'WHY DIAMORA', href: '#whydiamora', isRoute: false },
    { id: 'CONTACT', label: 'CONTACT', href: '#contact', isRoute: false },
  ];

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('HOME');
    } else if (location.pathname.startsWith('/shop')) {
      setActiveTab('SHOP');
    } else if (location.pathname.startsWith('/about')) {
      setActiveTab('ABOUT US');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchDynamicNavData();
  }, []);

  const fetchDynamicNavData = async () => {
    setLoadingNav(true);
    try {
      const [catRes, colRes] = await Promise.allSettled([
        api.get('/api/categories'),
        api.get('/api/collections')
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
        setCategories(catRes.value.data.data || []);
      }
      if (colRes.status === 'fulfilled' && colRes.value.data?.success) {
        setCollections(colRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic nav data:', err);
    } finally {
      setLoadingNav(false);
    }
  };

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    setMobileMenuOpen(false);
    setIsShopHovered(false);

    if (item.isRoute) {
      navigate(item.href);
      return;
    }

    const element = document.querySelector(item.href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleMouseEnterShop = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsShopHovered(true);
  };

  const handleMouseLeaveShop = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsShopHovered(false);
    }, 180);
  };

  const handleCloseShop = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsShopHovered(false);
  };

  const handleCategoryClick = (filterType, value) => {
    setIsShopHovered(false);
    setMobileMenuOpen(false);
    if (filterType && value) {
      navigate(`/shop?${filterType}=${encodeURIComponent(value)}`);
    } else {
      navigate('/shop');
    }
  };

  // Removed fake category arrays. Data is 100% loaded from backend APIs.

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 font-poppins transition-all duration-300 ${
        isCompact
          ? 'bg-[#0C0D10]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2 sm:py-2.5'
          : 'bg-transparent py-3 sm:py-4'
      }`}
      onMouseLeave={handleMouseLeaveShop}
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
                onMouseEnter={handleCloseShop}
                onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                className={`relative py-1 text-xs font-medium tracking-[0.2em] transition-colors duration-300 uppercase ${
                  isActive ? 'text-[#E0B094]' : 'text-[#C5C8D0] hover:text-[#E0B094]'
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

        {/* CENTER LOGO */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ease-in-out ${
            isCompact
              ? 'top-[calc(50%+9px)] -translate-y-1/2'
              : 'top-1/2 -translate-y-[30%]'
          }`}
          onMouseEnter={handleCloseShop}
        >
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            className="flex items-center justify-center group"
          >
            <img
              src="/diamora_logo.png"
              alt="Diamora Logo"
              className={`w-auto object-contain transition-all duration-300 ease-in-out filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                isCompact
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
              const isShop = item.id === 'SHOP';
              
              return (
                <div
                  key={item.id}
                  className="relative py-1"
                  onMouseEnter={isShop ? handleMouseEnterShop : handleCloseShop}
                  onMouseLeave={isShop ? handleMouseLeaveShop : undefined}
                >
                  <a
                    href={item.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                    className={`text-xs font-medium tracking-[0.2em] transition-colors duration-300 uppercase block ${
                      isActive || (isShop && isShopHovered) ? 'text-[#E0B094]' : 'text-[#C5C8D0] hover:text-[#E0B094]'
                    }`}
                  >
                    {item.label}
                  </a>
                  {(isActive || (isShop && isShopHovered)) && (
                    <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#E0B094] shadow-[0_0_8px_rgba(224,176,148,0.6)]" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* UTILITY ICONS: Search, User, Cart */}
          <div className="flex items-center space-x-4 border-l border-white/10 pl-6 text-[#F5F5F0]" onMouseEnter={handleCloseShop}>

            <button
              onClick={() => navigate('/shop')}
              className="p-1.5 hover:text-[#E0B094] transition-colors focus:outline-none"
              title="Search Jewellery"
            >
              <Search className="w-4 h-4" />
            </button>

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

        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden flex items-center space-x-3">
          <button
            onClick={onOpenShop}
            className="relative p-1.5 text-[#F5F5F0] hover:text-[#E0B094]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E0B094] text-[#0C0D10] text-[9px] font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#F5F5F0] hover:text-[#E0B094] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* COMPACT DARK GLASSMORPHIC SHOP MEGA MENU DROPDOWN (Easy In/Out Animation) */}
      <div 
        className={`absolute top-full left-0 right-0 z-50 pt-2 px-4 font-poppins transition-all duration-300 ease-in-out transform origin-top ${
          isShopHovered
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
        }`}
        onMouseEnter={handleMouseEnterShop}
        onMouseLeave={handleMouseLeaveShop}
      >
        <div className="max-w-2xl mx-auto bg-[#16181F]/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 text-[#F5F5F0]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              
              {/* DYNAMIC JEWELLERY CATEGORIES */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#E0B094] uppercase block border-b border-white/10 pb-1.5">
                  JEWELLERY CATEGORIES
                </span>
                <div className="space-y-2 text-xs font-medium text-[#C5C8D0]">
                  {loadingNav ? (
                    <div className="space-y-2 animate-pulse py-1">
                      <div className="h-3.5 bg-white/10 rounded w-28" />
                      <div className="h-3.5 bg-white/10 rounded w-36" />
                      <div className="h-3.5 bg-white/10 rounded w-24" />
                      <div className="h-3.5 bg-white/10 rounded w-32" />
                    </div>
                  ) : categories.length === 0 ? (
                    <span className="text-xs text-[#C5C8D0]/60 italic block py-1 font-normal">No categories created</span>
                  ) : (
                    categories.map(cat => (
                      <button
                        key={cat.id || cat.title}
                        onClick={() => handleCategoryClick('category', cat.title)}
                        className="block hover:text-[#E0B094] transition-colors text-left w-full py-0.5 tracking-wide"
                      >
                        {cat.title}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* DYNAMIC COLLECTIONS */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#E0B094] uppercase block border-b border-white/10 pb-1.5">
                  COLLECTIONS
                </span>
                <div className="space-y-2 text-xs font-medium text-[#C5C8D0]">
                  {loadingNav ? (
                    <div className="space-y-2 animate-pulse py-1">
                      <div className="h-3.5 bg-white/10 rounded w-32" />
                      <div className="h-3.5 bg-white/10 rounded w-24" />
                      <div className="h-3.5 bg-white/10 rounded w-28" />
                      <div className="h-3.5 bg-white/10 rounded w-36" />
                    </div>
                  ) : collections.length === 0 ? (
                    <span className="text-xs text-[#C5C8D0]/60 italic block py-1 font-normal">No collections created</span>
                  ) : (
                    collections.map(col => (
                      <button
                        key={col.id || col.title}
                        onClick={() => handleCategoryClick('collection', col.title)}
                        className="block hover:text-[#E0B094] transition-colors text-left w-full py-0.5 tracking-wide"
                      >
                        {col.title}
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>


      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0D10]/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 mt-3 shadow-2xl space-y-5 animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col space-y-3">
            {[...leftNavItems, ...rightNavItems].map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                className={`text-left text-xs font-semibold tracking-[0.2em] py-2 border-b border-white/5 uppercase ${
                  activeTab === item.id ? 'text-[#E0B094]' : 'text-[#C5C8D0]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-2 space-y-2 border-t border-white/10">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#E0B094] uppercase block">
              DYNAMIC CATEGORIES
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#C5C8D0]">
              {loadingNav ? (
                <>
                  <div className="h-7 bg-white/10 rounded-lg animate-pulse col-span-1" />
                  <div className="h-7 bg-white/10 rounded-lg animate-pulse col-span-1" />
                  <div className="h-7 bg-white/10 rounded-lg animate-pulse col-span-1" />
                  <div className="h-7 bg-white/10 rounded-lg animate-pulse col-span-1" />
                </>
              ) : categories.length === 0 ? (
                <span className="text-xs text-[#C5C8D0]/60 italic col-span-2">No categories available</span>
              ) : (
                categories.map(cat => (
                  <button
                    key={`mcat-${cat.id || cat.title}`}
                    onClick={() => handleCategoryClick('category', cat.title)}
                    className="text-left py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                  >
                    {cat.title}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-white/10 text-[#F5F5F0]">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/shop'); }}
              className="flex items-center gap-2 text-xs text-[#E0B094] hover:text-white font-semibold"
            >
              <Search className="w-4 h-4" />
              <span>ALL JEWELLERY</span>
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
                onClick={() => { setMobileMenuOpen(false); if (onOpenAuthModal) onOpenAuthModal(); }}
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
