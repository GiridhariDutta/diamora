import React, { useEffect } from 'react';
import { Diamond, ShieldCheck, Heart, Sparkles, Gem, Clock, Award } from 'lucide-react';

export default function WhyDiamoraPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const points = [
    {
      title: 'Natural Diamonds',
      icon: <Gem className="w-5 h-5 text-[#E0B094]" />,
      description: 'Every Diamoras piece is crafted with genuine natural diamonds, selected for their beauty, brilliance and quality. All the diamonds are IGI certified.'
    },
    {
      title: 'Exceptional Quality',
      icon: <Award className="w-5 h-5 text-[#E0B094]" />,
      description: 'We believe luxury begins with quality. From diamond selection to craftsmanship and finishing, every detail is carefully considered to create jewellery made to be treasured.'
    },
    {
      title: 'Honest & Transparent',
      icon: <ShieldCheck className="w-5 h-5 text-[#E0B094]" />,
      description: 'We keep things simple and transparent. You deserve to know what you are buying, why it is priced the way it is, and the quality behind your jewellery.'
    },
    {
      title: 'Beautiful Designs',
      icon: <Sparkles className="w-5 h-5 text-[#E0B094]" />,
      description: 'From everyday elegance to statement pieces, our collections are designed to be contemporary, timeless and effortlessly wearable.'
    },
    {
      title: 'Exceptional Value',
      icon: <Diamond className="w-5 h-5 text-[#E0B094]" />,
      description: 'Our philosophy is simple: beautiful diamonds at fair prices. By focusing on what truly matters—diamond quality, craftsmanship and design—we aim to offer exceptional value.'
    },
    {
      title: 'Crafted for Your Moments',
      icon: <Heart className="w-5 h-5 text-[#E0B094]" />,
      description: 'A diamond is more than a precious stone. It marks a promise, a celebration, a milestone or simply a moment that belongs to you. Diamoras creates jewellery for those moments—and for all the moments that follow.'
    },
    {
      title: 'Personalised Service',
      icon: <Clock className="w-5 h-5 text-[#E0B094]" />,
      description: 'Choosing diamond jewellery is personal. Our team is here to help you understand your options and make your purchase with confidence.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-open-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="font-cinzel text-3xl md:text-5xl font-bold text-white tracking-widest uppercase">
            Why <span className="text-[#E0B094]">DIAMORAS</span>?
          </h1>
          <h2 className="text-sm md:text-base font-semibold tracking-[0.2em] text-[#C5C8D0] uppercase">
            Brilliantly Priced, Beautifully Yours
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#E0B094] to-transparent mx-auto" />
          <p className="text-sm md:text-base text-[#C5C8D0]/80 leading-relaxed max-w-2xl mx-auto mt-6">
            At Diamoras, we believe buying diamond jewellery should be as beautiful and reassuring as wearing it. 
            We bring together natural diamonds, timeless designs and honest value to create jewellery that feels 
            luxurious without unnecessary mark-ups.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
          {points.map((point, index) => (
            <div 
              key={index}
              className={`bg-[#12131A] border border-white/10 hover:border-[#E0B094]/50 rounded-xl p-6 transition-all duration-300 shadow-xl group hover:-translate-y-1 ${
                index === points.length - 1 ? 'md:col-span-2 md:max-w-lg md:mx-auto w-full' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  {point.icon}
                </div>
                <div className="space-y-2 text-left flex-1">
                  <h3 className="font-cinzel font-bold text-[#E0B094] text-base tracking-wide flex items-center gap-2">
                    <span className="text-white/40 text-xs">✦</span>
                    {point.title}
                  </h3>
                  <p className="text-[#C5C8D0]/70 text-xs sm:text-sm leading-relaxed text-justify hyphens-auto">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Promise Section */}
        <div className="relative mt-20 p-8 md:p-12 border border-[#E0B094]/30 rounded-2xl bg-gradient-to-br from-[#12131A] to-[#0C0D10] text-center overflow-hidden shadow-[0_20px_60px_rgba(224,176,148,0.05)]">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#E0B094]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E0B094]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 space-y-6">
            <h3 className="font-cinzel text-xl md:text-2xl font-bold text-white tracking-widest uppercase">
              The <span className="text-[#E0B094]">Diamoras</span> Promise
            </h3>
            <div className="w-16 h-px bg-[#E0B094]/40 mx-auto" />
            <div className="space-y-3 font-cinzel text-sm md:text-base font-semibold text-[#C5C8D0] tracking-wider uppercase">
              <p>Natural Diamonds.</p>
              <p>Beautiful Craftsmanship.</p>
              <p>Transparent Value.</p>
              <p>Timeless Elegance.</p>
            </div>
            <p className="pt-6 font-medium text-[#E0B094] italic tracking-widest text-xs md:text-sm">
              Because you deserve to know the story behind your sparkle.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
