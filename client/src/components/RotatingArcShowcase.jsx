import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Eye, Diamond, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { addToCart, showCartAlert } from '../utils/cartManager';

export default function RotatingArcShowcase({ onOpenShop }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [activeItem, setActiveItem] = useState(null);

  const animRef = useRef(null);
  const sectionRef = useRef(null);
  const fetchedPages = useRef(new Set());

  // Listen to window resize for responsive arch radii without layout thrashing on frame updates
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver to pause auto-scroll & fetching when section is out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const transformProduct = (p) => {
    const image = p.media && p.media.length > 0 
      ? (typeof p.media[0] === 'string' ? p.media[0] : p.media[0]?.url)
      : p.image || '/images/ring_hero.jpg';
    
    const rawPrice = p.grandTotal || p.computedGoldPrice || p.price;
    const formattedPrice = rawPrice ? `₹${Number(rawPrice).toLocaleString('en-IN')}` : 'Contact for Price';

    return {
      id: p.id || `prod-${Math.random()}`,
      title: p.title || 'Exclusive Jewelry',
      category: p.categoryTitle || p.collectionTitle || 'FINE JEWELRY',
      price: formattedPrice,
      image: image
    };
  };

  // Initial Fetch (Page 1, limit 10 where showInCarousel is true)
  const fetchInitialCarouselProducts = async () => {
    setLoadingInitial(true);
    fetchedPages.current.add(1);
    try {
      const res = await api.get('/api/products', {
        params: { showInCarousel: true, page: 1, limit: 10 }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const items = res.data.data.map(transformProduct);
        setProducts(items);
        if (res.data.pagination) {
          setHasNextPage(Boolean(res.data.pagination.hasNextPage));
        }
      }
    } catch (err) {
      console.error('Error fetching initial carousel products:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchInitialCarouselProducts();
  }, []);

  // Fetch Next Page (Limit 10)
  const fetchNextPage = useCallback(async (nextPageNum) => {
    if (loadingMore || !hasNextPage || fetchedPages.current.has(nextPageNum)) return;
    
    fetchedPages.current.add(nextPageNum);
    setLoadingMore(true);
    try {
      const res = await api.get('/api/products', {
        params: { showInCarousel: true, page: nextPageNum, limit: 10 }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const newItems = res.data.data.map(transformProduct);
        setProducts(prev => [...prev, ...newItems]);
        setPage(nextPageNum);
        if (res.data.pagination) {
          setHasNextPage(Boolean(res.data.pagination.hasNextPage));
        }
      }
    } catch (err) {
      console.error('Error fetching next carousel page:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore]);

  // Orbital Arch Configuration
  const numProducts = products.length;
  const visibleCount = 6; // Show 5-6 cards across top arc
  const arcSpanDeg = 150; // Total arc angle span (-75 deg to +75 deg)
  const angleStep = arcSpanDeg / Math.max(1, visibleCount - 1); // ~30 deg between visible cards

  // Decoupled pre-fetch trigger check (runs outside of 60FPS state update callbacks)
  useEffect(() => {
    if (isSectionInView && hasNextPage && !loadingMore && products.length > 0) {
      const currentIndex = Math.floor((rotationAngle / angleStep) % products.length);
      const remainingItems = products.length - currentIndex;
      if (remainingItems <= 5) {
        fetchNextPage(page + 1);
      }
    }
  }, [rotationAngle, isSectionInView, hasNextPage, loadingMore, products.length, page, angleStep, fetchNextPage]);

  // Ultra-smooth 60FPS continuous clockwise rotation loop
  useEffect(() => {
    let lastTime = performance.now();

    const updateRotation = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Only auto-scroll if section is visible in viewport AND user is not hovering
      if (isSectionInView && !isPaused && products.length > 0) {
        setRotationAngle((prev) => prev + (deltaTime * 0.012));
      }

      animRef.current = requestAnimationFrame(updateRotation);
    };

    animRef.current = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animRef.current);
  }, [isSectionInView, isPaused, products.length]);

  // Manual rotation controls
  const handlePrev = () => {
    if (products.length === 0) return;
    setRotationAngle((prev) => prev - (360 / products.length));
  };

  const handleNext = () => {
    if (products.length === 0) return;
    setRotationAngle((prev) => prev + (360 / products.length));
  };

  const skeletonAngles = [-60, -30, 0, 30, 60];

  return (
    <section ref={sectionRef} className="relative w-full min-h-[660px] sm:min-h-[760px] bg-[#0C0D10] text-[#F5F5F0] pt-20 sm:pt-28 lg:pt-32 pb-12 px-4 overflow-hidden flex flex-col justify-between select-none z-20">
      
      {/* Background Radial Glow & Hairline Grid */}
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-30 z-0" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[300px] sm:h-[400px] bg-radial from-[#D4AF37]/12 via-[#E0B094]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* ROTATING CLOCKWISE TOP ARCH CAROUSEL STAGE */}
      <div 
        className="relative max-w-7xl w-full mx-auto h-[440px] sm:h-[500px] flex items-center justify-center z-10 pt-16 sm:pt-20"
      >

        {/* SKELETON LOADING STATE FOR 3D ARC Showcase */}
        {loadingInitial && products.length === 0 ? (
          skeletonAngles.map((relAngle, idx) => {
            const relAngleRad = (relAngle * Math.PI) / 180;
            const absAngleRatio = Math.abs(relAngle) / 80;

            const rx = isMobile ? 220 : 420;
            const ry = isMobile ? 110 : 185;

            const x = Math.sin(relAngleRad) * rx;
            const y = (1 - Math.cos(relAngleRad)) * ry - 165;

            const opacity = Math.max(0.15, Math.min(1, 1 - Math.pow(absAngleRatio, 1.6) * 0.88));
            const scale = Math.max(0.6, 1.08 - (absAngleRatio * 0.45));
            const zIndex = Math.round((1 - absAngleRatio) * 50) + 10;
            const cardTilt = Math.sin(relAngleRad) * 22;
            const isPeakCenter = absAngleRatio < 0.2;

            return (
              <div
                key={`skeleton-${idx}`}
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale}) rotate(${cardTilt}deg)`,
                  opacity: opacity,
                  zIndex: zIndex,
                  pointerEvents: 'none',
                  willChange: 'transform, opacity'
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div 
                  className={`relative w-[155px] sm:w-[195px] md:w-[220px] aspect-[4/5] rounded-2xl sm:rounded-3xl bg-[#12131A]/90 border p-2.5 sm:p-3 shadow-[0_14px_35px_rgba(0,0,0,0.9)] flex flex-col justify-between ${
                    isPeakCenter ? 'border-[#E0B094]/40' : 'border-white/10'
                  }`}
                >
                  {/* Skeleton Image Placeholder */}
                  <div className="relative w-full h-[75%] rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 animate-pulse shrink-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                  </div>

                  {/* Skeleton Text Placeholders */}
                  <div className="py-1.5 sm:py-2 px-1 flex flex-col justify-center items-center gap-1.5 grow">
                    <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="h-2.5 w-1/2 rounded bg-[#E0B094]/20 animate-pulse" />
                  </div>
                </div>
              </div>
            );
          })
        ) : null}

        {/* TOP ARCH ORBITING PRODUCT CARDS */}
        {products.map((item, index) => {
          // Calculate continuous relative position along the top arc
          // Total virtual angle loop = numProducts * angleStep
          const totalLoopAngle = numProducts * angleStep;
          let currentAngle = ((rotationAngle + (index * angleStep)) % totalLoopAngle);
          if (currentAngle < 0) currentAngle += totalLoopAngle;

          // Map angle so 0 deg is top center peak, ranging from -75 deg to +75 deg
          let relAngle = currentAngle - (arcSpanDeg / 2);
          
          // Wrap around for continuous loop outside the visible span
          if (relAngle > totalLoopAngle / 2) relAngle -= totalLoopAngle;
          if (relAngle < -totalLoopAngle / 2) relAngle += totalLoopAngle;

          // Check if card is inside visible top arc range (-80 deg to +80 deg)
          const isVisible = relAngle >= -82 && relAngle <= 82;
          if (!isVisible) return null;

          const relAngleRad = (relAngle * Math.PI) / 180;
          const absAngleRatio = Math.abs(relAngle) / 80; // 0 at center, 1 at edge

          // Curved top arch coordinates
          // Horizontal radius Rx = 420px (mobile 220px), Vertical arch depth Ry = 185px for a deep rounded arch
          const rx = isMobile ? 220 : 420;
          const ry = isMobile ? 110 : 185;
          
          const x = Math.sin(relAngleRad) * rx;
          const y = (1 - Math.cos(relAngleRad)) * ry - 165; // Deep inverted arch bowing over top center

          // Smooth Opacity & Scale Envelope:
          // 100% at center (relAngle = 0), fading down to 12% at edges (+-75 deg)
          const opacity = Math.max(0, Math.min(1, 1 - Math.pow(absAngleRatio, 1.6) * 0.88));
          const scale = Math.max(0.6, 1.08 - (absAngleRatio * 0.45)); // 1.08 center, 0.63 edges
          const zIndex = Math.round((1 - absAngleRatio) * 50) + 10;
          const cardTilt = Math.sin(relAngleRad) * 22; // Pronounced card tilt following the rounded arc curve

          const isPeakCenter = absAngleRatio < 0.2;

          return (
            <div
              key={item.id}
              onClick={() => {
                navigate(`/product/${item.id}`);
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale}) rotate(${cardTilt}deg)`,
                opacity: opacity,
                zIndex: zIndex,
                pointerEvents: opacity < 0.2 ? 'none' : 'auto',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden'
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              {/* Product Card Solid Dark Container (Sharp Crisp Visibility) */}
              <div 
                className={`relative w-[155px] sm:w-[195px] md:w-[220px] aspect-[4/5] rounded-2xl sm:rounded-3xl bg-[#12131A] border p-2.5 sm:p-3 transition-colors duration-300 shadow-[0_14px_35px_rgba(0,0,0,0.9)] antialiased flex flex-col justify-between ${
                  isPeakCenter
                    ? 'border-[#E0B094] stroke-2'
                    : 'border-white/15 group-hover:border-[#E0B094]/60'
                }`}
              >
                
                {/* Product Image Frame (Expanded to 75% height) */}
                <div className="relative w-full h-[75%] rounded-xl sm:rounded-2xl overflow-hidden bg-black shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover filter brightness-105 contrast-110 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50" />
                </div>

                {/* Sharp Clear Card Title, Price & Quick Cart Button */}
                <div className="py-1.5 sm:py-2 px-1 flex items-center justify-between gap-1 grow border-t border-white/10 mt-1">
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-cinzel font-medium text-[11px] sm:text-xs text-[#F0F2F5] tracking-normal line-clamp-2 leading-snug group-hover:text-[#E0B094] transition-colors" title={item.title}>
                      {item.title}
                    </h4>

                    <p className="font-poppins font-medium text-[10px] sm:text-[11px] text-[#E0B094] tracking-wide mt-0.5">
                      {item.price}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item, 1);
                      showCartAlert(item, navigate);
                    }}
                    className="p-1.5 rounded-lg bg-black/80 hover:bg-[#E0B094] text-[#E0B094] hover:text-[#0C0D10] border border-[#E0B094]/40 hover:border-[#E0B094] transition-all duration-300 shadow-md shrink-0 cursor-pointer"
                    title="Add to Shopping Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {/* CENTER TYPOGRAPHY OVERLAY (PUSHED TO THE BOTTOM STAGE FOR UN-OBSTRUCTED CARD VISION) */}
        <div className="relative z-40 text-center max-w-2xl px-4 pointer-events-none mt-48 sm:mt-56 lg:mt-60">
          
          {/* Headline */}
          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.14em] text-white leading-tight mb-2">
            <span className="bg-gradient-to-r from-white via-[#F7E09A] to-[#E0B094] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(247,224,154,0.35)]">
              THE ESSENTIALS
            </span>
          </h2>

          {/* Subtitle in One Line */}
          <p className="font-open-sans text-[11px] sm:text-xs text-[#B0B3BC] whitespace-nowrap overflow-hidden text-ellipsis font-normal tracking-wide max-w-full mx-auto mb-5">
            Jewelry that becomes second skin. Worn every day, loved by generations.
          </p>

          {/* CTA Button */}
          <div className="pointer-events-auto flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (onOpenShop) onOpenShop();
                navigate('/shop');
              }}
              className="group font-poppins px-7 py-3 border border-[#E0B094]/70 hover:border-[#E0B094] bg-black/80 hover:bg-[#E0B094]/15 text-[#E0B094] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.7)]"
            >
              <span>SHOP THE ESSENTIALS</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>

      {/* BOTTOM CONTROLS & PAUSE INDICATOR */}
      <div className="relative z-30 max-w-7xl w-full mx-auto px-6 pt-6 flex items-center justify-between text-xs font-poppins text-[#808490]">
        
        {/* Rotation Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full border border-white/10 bg-black/40 hover:bg-[#E0B094]/15 hover:border-[#E0B094]/60 text-white transition-all"
            title="Rotate Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full border border-white/10 bg-black/40 hover:bg-[#E0B094]/15 hover:border-[#E0B094]/60 text-white transition-all"
            title="Rotate Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-[10px] tracking-widest text-[#9B9EA7] uppercase hidden sm:inline">
            {!isSectionInView 
              ? 'PAUSED (OUT OF VIEW)' 
              : isPaused 
                ? 'PAUSED (HOVERING CARD)' 
                : 'AUTOPLAYING CLOCKWISE'}
          </span>
        </div>

        {/* Rarity Label */}
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#E0B094] uppercase">
          <Diamond className="w-3 h-3" />
          <span>HANDPICKED GOLD & SOLITAIRES</span>
        </div>

      </div>

    </section>
  );
}
