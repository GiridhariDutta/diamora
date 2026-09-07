import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Eye, Diamond } from 'lucide-react';

export default function RotatingArcShowcase({ onOpenShop }) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const animRef = useRef(null);

  const products = [
    {
      id: 'ring-solitaire',
      title: 'Oval Solitaire Ring',
      category: '18K YELLOW GOLD',
      price: '$2,450',
      image: '/images/ring_hero.jpg'
    },
    {
      id: 'necklace-riviere',
      title: 'Riviere Diamond Choker',
      category: 'PLATINUM 950',
      price: '$5,800',
      image: '/images/necklace_hero.jpg'
    },
    {
      id: 'marquise-ring',
      title: 'Marquise Victoria Band',
      category: '18K GOLD & DIAMOND',
      price: '$3,120',
      image: '/images/Diamond_drop_earrings_displayed_202608261740.jpeg'
    },
    {
      id: 'emerald-ring',
      title: 'Diamond Nath Craft',
      category: 'SOLITAIRE COLLECTION',
      price: '$4,900',
      image: '/images/Diamond_Nath_product_photography_202608261800.jpeg'
    },
    {
      id: 'venus-ring',
      title: 'Royal Diamond Bangle',
      category: 'HIGH JEWELRY',
      price: '$6,200',
      image: '/images/Diamond_bangle_product_shot_202608271248.jpeg'
    },
    {
      id: 'huggie-earrings',
      title: 'Place Vendôme Huggies',
      category: '18K SOLID GOLD',
      price: '$1,850',
      image: '/images/Diamond_hoop_earrings_displayed_202608261741.jpeg'
    },
    {
      id: 'pave-band',
      title: 'Pavé Eternity Band',
      category: 'DIAMOND ESSENTIALS',
      price: '$2,980',
      image: '/images/Diamond_stud_earrings_in_setting_202608261741.jpeg'
    },
    {
      id: 'gold-bangle',
      title: 'Architectural Gold Cuff',
      category: 'FINE JEWELRY',
      price: '$4,150',
      image: '/images/Diamond_cuff_bracelet_photography_202608271248.jpeg'
    },
    {
      id: 'trio-pendant',
      title: 'Trio Solitaire Pendant',
      category: 'NECKLACES',
      price: '$3,400',
      image: '/images/necklace_hero.jpg'
    },
    {
      id: 'heritage-signet',
      title: 'Heritage Gold Signet',
      category: 'RINGS',
      price: '$1,950',
      image: '/images/ring_hero.jpg'
    },
    {
      id: 'baguette-drop',
      title: 'Baguette Diamond Drops',
      category: 'EARRINGS',
      price: '$2,750',
      image: '/images/Diamond_drop_earrings_displayed_202608261741.jpeg'
    },
    {
      id: 'radiant-halo',
      title: 'Radiant Nose Ring',
      category: 'SOLITAIRE COLLECTION',
      price: '$5,100',
      image: '/images/Diamond_nose_ring_close_up_202608261801.jpeg'
    },
    {
      id: 'venetian-chain',
      title: 'Venetian Gold Chain',
      category: '18K SOLID GOLD',
      price: '$2,280',
      image: '/images/necklace_hero.jpg'
    },
    {
      id: 'emerald-halo-pendant',
      title: 'Floral Cluster Stud',
      category: 'HIGH JEWELRY',
      price: '$4,650',
      image: '/images/Diamond_nose_stud_floral_cluster_202608261759.jpeg'
    },
    {
      id: 'comfort-fit-band',
      title: 'Comfort-Fit Dome Band',
      category: 'ESSENTIAL RINGS',
      price: '$1,650',
      image: '/images/ring_hero.jpg'
    },
    {
      id: 'astral-pave-cuff',
      title: 'Astral Diamond Cuff',
      category: 'HAUTE JOAILLERIE',
      price: '$7,400',
      image: '/images/Diamond_cuff_bracelet_photography_202608271248.jpeg'
    }
  ];

  // Smooth continuous clockwise rotation loop
  useEffect(() => {
    let lastTime = performance.now();

    const updateRotation = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused) {
        // Increment angle clockwise (~0.012 degrees per ms)
        setRotationAngle((prev) => (prev + (deltaTime * 0.012)) % 360);
      }
      animRef.current = requestAnimationFrame(updateRotation);
    };

    animRef.current = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused]);

  // Manual rotation controls (steps precisely 1 item angle)
  const handlePrev = () => {
    setRotationAngle((prev) => prev - (360 / products.length));
  };

  const handleNext = () => {
    setRotationAngle((prev) => prev + (360 / products.length));
  };

  // Orbital Arch Configuration
  const numProducts = products.length;
  const visibleCount = 6; // Show 5-6 cards across top arc
  const arcSpanDeg = 150; // Total arc angle span (-75 deg to +75 deg)
  const angleStep = arcSpanDeg / (visibleCount - 1); // ~30 deg between visible cards

  return (
    <section className="relative w-full min-h-[660px] sm:min-h-[760px] bg-[#0C0D10] text-[#F5F5F0] pt-20 sm:pt-28 lg:pt-32 pb-12 px-4 overflow-hidden flex flex-col justify-between select-none z-20">
      
      {/* Background Radial Glow & Hairline Grid */}
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-30 z-0" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[300px] sm:h-[400px] bg-radial from-[#D4AF37]/12 via-[#E0B094]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* ROTATING CLOCKWISE TOP ARCH CAROUSEL STAGE */}
      <div 
        className="relative max-w-7xl w-full mx-auto h-[440px] sm:h-[500px] flex items-center justify-center z-10 pt-16 sm:pt-20"
      >

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
          const rx = typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 420;
          const ry = typeof window !== 'undefined' && window.innerWidth < 640 ? 110 : 185;
          
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
                setActiveItem(item);
                if (onOpenShop) onOpenShop();
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale}) rotate(${cardTilt}deg)`,
                opacity: opacity,
                zIndex: zIndex,
                pointerEvents: opacity < 0.2 ? 'none' : 'auto'
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-linear cursor-pointer group"
            >
              {/* Product Card Solid Dark Container (Sharp Crisp Visibility) */}
              <div 
                className={`relative w-[155px] sm:w-[195px] md:w-[220px] aspect-[4/5] rounded-2xl sm:rounded-3xl bg-[#12131A] border p-2.5 sm:p-3 transition-all duration-300 shadow-[0_14px_35px_rgba(0,0,0,0.9)] antialiased flex flex-col justify-between ${
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

                {/* Sharp Clear Card Title & Price */}
                <div className="py-1.5 sm:py-2 text-center px-1 flex flex-col justify-center grow">
                  <h4 className="font-cinzel font-medium text-xs sm:text-[13px] text-[#F0F2F5] tracking-normal truncate group-hover:text-[#E0B094] transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <p className="font-poppins font-medium text-[11px] sm:text-xs text-[#E0B094] mt-0.5 tracking-wide">
                    {item.price}
                  </p>
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
              onClick={onOpenShop}
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
            {isPaused ? 'PAUSED (HOVERING CARD)' : 'AUTOPLAYING CLOCKWISE'}
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
