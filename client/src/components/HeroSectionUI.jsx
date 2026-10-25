import React, { useState, useEffect, useRef } from 'react';

export default function HeroSectionUI() {
  // Static image paths from the public folder (WebP format for fast loading)
  const desktopImages = [
    '/images/desktop_hero_section_1.webp',
    '/images/hero2.webp',
    '/images/hero3.webp'
  ];
  const mobileImages = [
    '/images/mobile_hero_3.webp',
    '/images/mobile_hero_2.webp',
    '/images/mobile_hero_section_1.webp'
  ];

  const [desktopIndex, setDesktopIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  // Refs for mobile touch swipe gestures & timers
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwiping = useRef(false);
  const mobileTimerRef = useRef(null);

  const resetMobileTimer = () => {
    if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
    mobileTimerRef.current = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % mobileImages.length);
    }, 5000);
  };

  // Auto-advance slideshow with continuous smooth fade in / zoom out
  useEffect(() => {
    const dTimer = setInterval(() => {
      setDesktopIndex((prev) => (prev + 1) % desktopImages.length);
    }, 5000);

    resetMobileTimer();

    return () => {
      clearInterval(dTimer);
      if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
    };
  }, [desktopImages.length, mobileImages.length]);

  // Touch Swipe Gesture Handlers for Mobile View
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Detect if movement is primarily horizontal
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.changedTouches[0]?.clientX || touchStartX.current;
    const currentY = e.changedTouches[0]?.clientY || touchStartY.current;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Minimum swipe distance threshold (40px)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next Slide
        setMobileIndex((prev) => (prev + 1) % mobileImages.length);
      } else {
        // Swiped Right -> Previous Slide
        setMobileIndex((prev) => (prev - 1 + mobileImages.length) % mobileImages.length);
      }
      resetMobileTimer();
      setTimeout(() => {
        isSwiping.current = false;
      }, 100);
    } else {
      isSwiping.current = false;
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleClick = (e) => {
    if (isSwiping.current) {
      isSwiping.current = false;
      return;
    }
    if (e && e.preventDefault) e.preventDefault();
    const collectionSection = document.getElementById('collection');
    if (collectionSection) {
      const navOffset = 64;
      const elementPosition = collectionSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full bg-[#0C0D10] pt-[64px] sm:pt-[69px] select-none">
      
      {/* Desktop Slideshow with Ken Burns Zoom Down and Fade In */}
      <div className="relative w-full hidden sm:block overflow-hidden">
        {desktopImages.map((imgSrc, idx) => (
          <img 
            key={imgSrc}
            src={imgSrc} 
            alt={`Diamora Collection Desktop ${idx + 1}`} 
            className={`w-full h-auto object-cover transform transition-all duration-1000 ease-in-out origin-center ${
              idx === 0 ? '' : 'absolute inset-0 w-full h-full'
            } ${
              desktopIndex === idx 
                ? 'opacity-100 scale-100 z-10' 
                : 'opacity-0 scale-105 pointer-events-none z-0'
            }`}
          />
        ))}

        {/* Minimal luxury slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {desktopImages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setDesktopIndex(idx);
              }}
              className={`h-1 transition-all duration-500 rounded-full cursor-pointer ${
                desktopIndex === idx 
                  ? 'w-6 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]' 
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Mobile Slideshow with Ken Burns Zoom Down, Fade In & Touch Swipe */}
      <div 
        className="relative w-full block sm:hidden overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {mobileImages.map((imgSrc, idx) => (
          <img 
            key={imgSrc}
            src={imgSrc} 
            alt={`Diamora Collection Mobile ${idx + 1}`} 
            className={`w-full h-auto transform transition-all duration-1000 ease-in-out origin-center ${
              mobileIndex === idx 
                ? 'opacity-100 scale-100 z-10' 
                : 'opacity-0 scale-105 absolute inset-0 pointer-events-none z-0'
            }`}
          />
        ))}

        {/* Minimal luxury slide indicators for mobile */}
        {mobileImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {mobileImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileIndex(idx);
                  resetMobileTimer();
                }}
                className={`h-1 transition-all duration-500 rounded-full cursor-pointer ${
                  mobileIndex === idx 
                    ? 'w-5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]' 
                    : 'w-1.5 bg-white/40'
                }`}
                title={`Mobile Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clickable transparent overlay covering the entire image */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer mt-[64px] sm:mt-[69px]"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        title="Explore Collection"
      />

    </div>
  );
}

