import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, ChevronRight, Info, ShieldCheck, Diamond, Award, Compass } from 'lucide-react';
import Ring3DCanvas from './Ring3DCanvas';

export default function HeroScrollSection({ 
  currentScene, 
  setCurrentScene, 
  onOpenTickets, 
  onExploreCollection,
  haloMood = 'white'
}) {
  const containerRef = useRef(null);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate overall scroll percentage inside pinned container
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      setScrollProgress(progress);

      let scene = 0;
      if (progress < 0.25) scene = 0;
      else if (progress < 0.55) scene = 1;
      else if (progress < 0.82) scene = 2;
      else scene = 3;

      if (scene !== currentScene) {
        setCurrentScene(scene);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentScene, setCurrentScene]);

  // Hotspots info on ring
  const hotspots = [
    {
      id: 'gemstone',
      top: '26%',
      left: '50%',
      title: '4.20 Carat Oval Brilliant Cut',
      description: 'Refractive index 2.417 diamond physics, Type IIa chemical purity representing top 0.01% of natural gems.'
    },
    {
      id: 'setting',
      top: '48%',
      left: '42%',
      title: 'Platinum 950 Eagle Claw Prongs',
      description: 'Hand-sculpted 4-prong basket in solid 950 platinum with hidden micro-pavé gallery.'
    },
    {
      id: 'band',
      top: '64%',
      left: '60%',
      title: 'Comfort-Fit Micro-Pavé Shank',
      description: 'Engineered with 38 brilliant micro-diamonds pave-set along the split ring shank.'
    }
  ];

  // Gemological specification rows for Scene 3
  const specRows = [
    { label: 'CARAT WEIGHT', value: '4.20 Carats' },
    { label: 'COLOR GRADE', value: 'D-Flawless (Type IIa)' },
    { label: 'DIAMOND CUT', value: 'Ideal Oval Brilliant' },
    { label: 'PRECIOUS METAL', value: 'Solid Platinum 950' },
    { label: 'CLARITY GRADE', value: 'Flawless (FL)' },
    { label: 'GIA CERTIFICATE', value: 'GIA Vault #6220891' },
  ];

  // Halo Class mapping
  const getHaloClass = () => {
    switch (haloMood) {
      case 'warm': return 'halo-ring-warm';
      case 'cool': return 'halo-ring-cool';
      case 'electric': return 'halo-ring-electric';
      default: return 'halo-ring-white';
    }
  };

  return (
    <section ref={containerRef} id="home" className="relative w-full h-[380vh]">
      
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* Floating Rounded Canvas Container */}
        <div className="relative w-[94vw] lg:w-[92vw] h-[88vh] max-w-7xl rounded-3xl bg-[#121214] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-14">
          
          {/* Subtle Vertical Hairline Gridlines Overlay */}
          <div className="absolute inset-0 hairline-grid pointer-events-none opacity-80 z-0" />

          {/* Halo Glow Radial Backdrop */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full halo-glow-radial pointer-events-none z-0" />

          {/* Top Bar Header inside Frame */}
          <div className="relative z-20 flex items-center justify-between">
            
            {/* Top-Left Eyebrow Label */}
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3B6EF5] animate-ping" />
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#9B9B9B] uppercase">
                HAUTE JOAILLERIE HALL 01 / FEATURED SOLITAIRE
              </span>
            </div>

            {/* Top-Right Active Halo Mood Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/40 text-[10px] font-mono text-[#9B9B9B] uppercase">
              <Sparkles className="w-3 h-3 text-[#3B6EF5]" />
              <span>LIGHTING: {haloMood.toUpperCase()} SPOTLIGHT</span>
            </div>
          </div>

          {/* Center Stage: Desktop 2-Column Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full my-auto">
            
            {/* Left Content Area (Span 6) — Cross-Fading Text Scenes */}
            <div className="lg:col-span-6 flex flex-col justify-center max-w-xl">
              <AnimatePresence mode="wait">
                
                {/* SCENE 0: Hero Intro */}
                {currentScene === 0 && (
                  <motion.div
                    key="scene-0"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Small Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#3B6EF5]/40 bg-[#3B6EF5]/10 text-[#3B6EF5] text-xs font-semibold tracking-[0.2em] uppercase">
                      <Diamond className="w-3.5 h-3.5" />
                      <span>SIGNATURE COLLECTION</span>
                    </div>

                    {/* Large Serif Display Headline */}
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F5F0] leading-[1.1] tracking-tight">
                      The Art of <br />
                      <span className="italic font-normal text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
                        Forever
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base text-[#9B9B9B] leading-relaxed max-w-md">
                      Immerse yourself in haute joaillerie. Where rare D-Flawless diamonds, hand-forged platinum 950, and 360-degree precision cut craftsmanship illuminate timeless romance.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <button
                        onClick={onOpenTickets}
                        className="px-6 py-3 rounded-full bg-[#3B6EF5] hover:bg-[#2A57D8] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(59,110,245,0.4)] hover:shadow-[0_0_30px_rgba(59,110,245,0.6)]"
                      >
                        <span>BOOK APPOINTMENT</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={onExploreCollection}
                        className="px-6 py-3 rounded-full border border-white/20 hover:border-white/50 bg-white/5 text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300"
                      >
                        VIEW HIGH JEWELRY
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 1: Product Name Reveal */}
                {currentScene === 1 && (
                  <motion.div
                    key="scene-1"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="text-xs font-mono tracking-[0.3em] text-[#3B6EF5] uppercase flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-[#3B6EF5]" />
                      <span>VAULT PIECE NO. LX-420</span>
                    </div>

                    <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#F5F5F0] leading-none tracking-wide uppercase">
                      The Eternal Solitaire
                    </h2>

                    <h3 className="font-serif italic text-xl text-[#9B9B9B]">
                      4.20 Carat Oval Cut — Platinum 950
                    </h3>

                    <p className="text-sm text-[#9B9B9B] leading-relaxed max-w-md">
                      A crowning achievement in luxury gemology. Sculpted with an elongated oval ratio designed to maximize fire and scintillation under light.
                    </p>

                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-[#9B9B9B] uppercase tracking-widest">MASTER JEWELER</p>
                        <p className="text-[#F5F5F0] font-serif text-sm font-medium">Maison Luxe Atelier</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#9B9B9B] uppercase tracking-widest">GEM RARITY</p>
                        <p className="text-[#3B6EF5] font-mono text-xs font-bold">TYPE IIa D-FLAWLESS</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 2: Gemological Specifications */}
                {currentScene === 2 && (
                  <motion.div
                    key="scene-2"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="text-xs font-mono tracking-[0.3em] text-[#3B6EF5] uppercase flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-[#3B6EF5]" />
                      <span>GEMOLOGICAL SPECIFICATIONS</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F5F0]">
                      Carat, Cut & Perfection
                    </h2>

                    {/* Staggered Specification Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {specRows.map((row, idx) => (
                        <motion.div
                          key={row.label}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.08 }}
                          className="p-3.5 rounded-xl border border-white/10 bg-white/5 hover:border-[#3B6EF5]/60 transition-colors"
                        >
                          <span className="text-[9px] font-mono tracking-widest text-[#9B9B9B] block uppercase">
                            {row.label}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-[#F5F5F0] mt-0.5 block">
                            {row.value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* SCENE 3: Closing Brand Craftsmanship */}
                {currentScene === 3 && (
                  <motion.div
                    key="scene-3"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="text-xs font-mono tracking-[0.3em] text-[#3B6EF5] uppercase flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-[#3B6EF5]" />
                      <span>CRAFTSMANSHIP LEGEND</span>
                    </div>

                    <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F5F0] leading-[1.15]">
                      Eternity Captured in <br />
                      <span className="italic text-[#3B6EF5]">Pure Light</span>
                    </h2>

                    <p className="text-sm text-[#9B9B9B] leading-relaxed max-w-md">
                      Each Luxe creation represents hundreds of hours of master setting in Place Vendôme. Schedule a private salon consultation to view this masterpiece in person.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <button
                        onClick={onOpenTickets}
                        className="px-6 py-3 rounded-full bg-[#3B6EF5] hover:bg-[#2A57D8] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2 shadow-[0_0_25px_rgba(59,110,245,0.5)]"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>RESERVE PRIVATE SALON VIEWING</span>
                      </button>

                      <button
                        onClick={onExploreCollection}
                        className="px-6 py-3 rounded-full border border-white/20 hover:border-white/50 text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300"
                      >
                        EXPLORE COLLECTION
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Right Column (Span 6) — REAL WEBGL 3D ROTATING DIAMOND RING */}
            <div className="lg:col-span-6 relative flex items-center justify-center h-[460px] sm:h-[540px] lg:h-[620px]">
              
              {/* Halo Glow Spotlight Ring Backdrop — Scaled background circle */}
              <div 
                className={`halo-ring w-[240px] sm:w-[300px] lg:w-[360px] h-[240px] sm:h-[300px] lg:h-[360px] transition-all duration-700 animate-halo-pulse pointer-events-none ${getHaloClass()}`}
              />

              {/* Halo Outer Dashed Arc — Scaled outer circle */}
              <div className="absolute w-[270px] sm:w-[340px] lg:w-[400px] h-[270px] sm:h-[340px] lg:h-[400px] rounded-full border border-white/10 animate-halo-spin pointer-events-none opacity-40 border-dashed" />

              {/* Three.js 3D WebGL Canvas Container (Pinned in X/Y position while spinning in 3D) */}
              <div className="relative z-10 w-[400px] sm:w-[500px] lg:w-[580px] h-[400px] sm:h-[500px] lg:h-[580px]">
                <Ring3DCanvas scrollProgress={scrollProgress} haloMood={haloMood} />

                {/* Hotspot Dots anchored to key points on the Ring Stage */}
                {hotspots.map((spot) => (
                  <div
                    key={spot.id}
                    style={{ top: spot.top, left: spot.left }}
                    className="absolute z-20 opacity-0 pointer-events-none"
                  >
                    <button
                      onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                      className="group relative flex items-center justify-center p-2 focus:outline-none"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#3B6EF5]/80 border-2 border-white animate-ping absolute" />
                      <span className="w-3 h-3 rounded-full bg-[#3B6EF5] border border-white shadow-[0_0_12px_#3B6EF5]" />
                    </button>

                    {/* Hotspot Info Popup */}
                    {activeHotspot === spot.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute left-6 top-0 w-64 glass-panel p-4 rounded-xl border border-white/20 z-30 shadow-2xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono tracking-widest text-[#3B6EF5] uppercase">GEM DETAILS</span>
                          <button onClick={() => setActiveHotspot(null)} className="text-white/60 hover:text-white text-xs">✕</button>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">{spot.title}</h4>
                        <p className="text-[11px] text-[#9B9B9B] leading-normal">{spot.description}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-2 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/50 text-[10px] text-[#9B9B9B] font-mono backdrop-blur-md">
                <Info className="w-3 h-3 text-[#3B6EF5]" />
                <span>SCROLL DOWN TO ROTATE REAL 3D DIAMOND RING 360°</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar Footer inside Frame */}
          <div className="relative z-20 flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
            
            {/* Scroll Indicator */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-7 rounded-full border border-white/30 flex items-start justify-center p-1">
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-1 h-1.5 rounded-full bg-[#3B6EF5]" 
                />
              </div>
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#9B9B9B] uppercase">
                SCROLL TO NAVIGATE ({currentScene + 1}/4)
              </span>
            </div>

            {/* Atelier Info */}
            <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono text-[#9B9B9B] tracking-widest">
              <span>LOCATION: PLACE VENDÔME, PARIS</span>
              <span className="text-white font-semibold">STATUS: PRIVATE VAULT</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
