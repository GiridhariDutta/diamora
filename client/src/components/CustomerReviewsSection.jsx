import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [withTransition, setWithTransition] = useState(true);
  const [stepWidth, setStepWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  const reviews = [
    {
      id: 'rev-1',
      name: 'Ananya S.',
      location: 'Kolkata',
      rating: 5,
      quote: 'The solitaire ring from Diamora is beyond beautiful. The sparkle, the quality, the packaging - absolutely perfect!'
    },
    {
      id: 'rev-2',
      name: 'Riddhima M.',
      location: 'Mumbai',
      rating: 5,
      quote: 'Exceptional craftsmanship and such elegant designs. Diamora is now my go-to for every special occasion.'
    },
    {
      id: 'rev-3',
      name: 'Pooja T.',
      location: 'Bangalore',
      rating: 5,
      quote: 'From selection to delivery, everything was seamless. The diamond quality is absolutely certified and genuine.'
    },
    {
      id: 'rev-4',
      name: 'Jamuna B.',
      location: 'Chennai',
      rating: 5,
      quote: 'The service rendered by the team is excellent. They answered all my doubts with patience and helped us pick the ideal ring.'
    },
    {
      id: 'rev-5',
      name: 'Vidhya S.',
      location: 'Hyderabad',
      rating: 5,
      quote: 'Loved their collections! Bought a lovely diamond nosepin, their response and service is top notch.'
    },
    {
      id: 'rev-6',
      name: 'Lalitha K.',
      location: 'Delhi',
      rating: 5,
      quote: 'Nice, patient and pleasant service. We acquired great knowledge about certified GIA diamonds and look forward to buying again.'
    },
    {
      id: 'rev-7',
      name: 'Devika R.',
      location: 'Ahmedabad',
      rating: 5,
      quote: 'The rose gold finish with micro-pavé diamonds is stunning. Delivered on time with complete certification documents.'
    },
    {
      id: 'rev-8',
      name: 'Shreya P.',
      location: 'Pune',
      rating: 5,
      quote: 'Bought our anniversary solitaire earrings here. The brilliance under sunlight is unreal, truly pure haute joaillerie.'
    },
    {
      id: 'rev-9',
      name: 'Meera N.',
      location: 'Jaipur',
      rating: 5,
      quote: 'Unmatched elegance and customer care. The custom sizing was done flawlessly within 48 hours.'
    },
    {
      id: 'rev-10',
      name: 'Ishita V.',
      location: 'Chandigarh',
      rating: 5,
      quote: 'Extremely polite staff and transparent pricing. The diamond clarity and cut exceeded all my expectations.'
    },
    {
      id: 'rev-11',
      name: 'Kirti G.',
      location: 'Kochi',
      rating: 5,
      quote: 'Pure luxury experience from unboxing to wearing. Every piece reflects master artisan expertise.'
    },
    {
      id: 'rev-12',
      name: 'Sneha B.',
      location: 'Surat',
      rating: 5,
      quote: 'Beautiful Ceylon sapphire band! The color tone is deep royal blue, framed by crisp white diamonds.'
    }
  ];

  // Append first 3 items for infinite wrap-around
  const extendedReviews = [...reviews, ...reviews.slice(0, 3)];

  // Measure container and set responsive card width (1 on mobile, 3 on desktop)
  useEffect(() => {
    const updateWidth = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const gap = 24; // 1.5rem gap
        const visible = mobile ? 1 : 3;
        setStepWidth((width + gap) / visible);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-shift ONE BY ONE from Right to Left every 3 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setWithTransition(true);
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Infinite loop reset
  useEffect(() => {
    if (currentIndex === reviews.length) {
      const wrapTimer = setTimeout(() => {
        setWithTransition(false);
        setCurrentIndex(0);
      }, 750);

      return () => clearTimeout(wrapTimer);
    }
  }, [currentIndex, reviews.length]);

  const handlePrev = () => {
    setWithTransition(true);
    setCurrentIndex((prev) => (prev <= 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <section className="relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-12 bg-[#0C0D10] text-[#F5F5F0] select-none z-20 overflow-hidden">
      
      {/* Background Hairline Gridlines */}
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-25 z-0" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-radial from-[#D4AF37]/6 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* CENTERED SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          {/* Eyebrow with Side Lines */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#E0B094]/60" />
            <span className="font-poppins text-xs sm:text-[13px] font-medium tracking-[0.28em] text-[#E0B094] uppercase">
              TRUSTED BY THOUSANDS
            </span>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#E0B094]/60" />
          </div>

          {/* Main Title */}
          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[0.04em] text-[#F5F5F0] leading-tight drop-shadow-[0_2px_15px_rgba(224,176,148,0.2)]">
            What Our Customers Say
          </h2>
        </div>

        {/* CAROUSEL STAGE WITH LEFT & RIGHT ARROWS */}
        <div className="relative px-2 sm:px-10">
          
          {/* LEFT CHEVRON ARROW */}
          <button
            onClick={handlePrev}
            aria-label="Previous Review"
            className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-[#14151C]/90 border border-[#E0B094]/30 hover:border-[#E0B094] text-[#E0B094] hover:bg-[#E0B094] hover:text-black transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* RIGHT CHEVRON ARROW */}
          <button
            onClick={handleNext}
            aria-label="Next Review"
            className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-[#14151C]/90 border border-[#E0B094]/30 hover:border-[#E0B094] text-[#E0B094] hover:bg-[#E0B094] hover:text-black transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* CAROUSEL TRACK (1 CARD ON MOBILE, 3 CARDS ON DESKTOP) */}
          <div 
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative overflow-hidden py-2"
          >
            <motion.div 
              className="flex gap-6"
              animate={{ 
                x: -currentIndex * stepWidth 
              }}
              transition={
                withTransition 
                  ? { duration: 0.7, ease: [0.25, 1, 0.5, 1] } 
                  : { duration: 0 }
              }
            >
              {extendedReviews.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  style={{ 
                    width: stepWidth ? `${stepWidth - 24}px` : (isMobile ? '100%' : 'calc((100% - 48px) / 3)'), 
                    minWidth: stepWidth ? `${stepWidth - 24}px` : (isMobile ? '100%' : 'calc((100% - 48px) / 3)') 
                  }}
                  className="flex-shrink-0 flex-grow-0 bg-[#0C0D10] border border-[#E0B094]/30 hover:border-[#E0B094]/60 p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center justify-between shadow-lg transition-all duration-300 group hover:-translate-y-1"
                >
                  {/* Top Golden Double Quote Mark (66 Icon) */}
                  <div className="mb-4">
                    <svg className="w-7 h-7 text-[#E0B094] opacity-85 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Review Text */}
                  <p className="font-open-sans text-xs sm:text-[13.5px] text-[#C5C8D4] font-normal leading-relaxed mb-6 max-w-xs mx-auto">
                    {item.quote}
                  </p>

                  {/* Author Name, Location & 5 Stars */}
                  <div className="flex flex-col items-center">
                    {/* Name */}
                    <h4 className="font-poppins font-medium text-xs sm:text-[13px] text-[#E0B094] tracking-wide mb-0.5">
                      — {item.name}
                    </h4>
                    
                    {/* Location */}
                    <span className="font-open-sans text-[11px] text-[#7A7E8B] font-normal mb-3">
                      {item.location}
                    </span>

                    {/* 5 Gold Stars */}
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#F7E09A] text-[#F7E09A]" />
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </motion.div>
          </div>

        </div>

        {/* BOTTOM PAGINATION DOTS */}
        <div className="flex items-center justify-center gap-2.5 mt-10">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setWithTransition(true);
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                (currentIndex % reviews.length) === idx 
                  ? 'w-6 bg-[#E0B094]' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

      </div>

    </section>
  );
}
