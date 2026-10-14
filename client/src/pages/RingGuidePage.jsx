import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ruler, 
  CircleDot, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Info, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  Gem
} from 'lucide-react';

// Comprehensive Indian Ring Size Chart (Sizes 1 to 30)
const RING_SIZE_DATA = [
  { size: 1, diameter: 13.0, circumference: 40.8, us: '1', uk: 'B' },
  { size: 2, diameter: 13.4, circumference: 42.1, us: '2', uk: 'D' },
  { size: 3, diameter: 13.7, circumference: 43.0, us: '2.5', uk: 'E' },
  { size: 4, diameter: 14.0, circumference: 44.0, us: '3', uk: 'F' },
  { size: 5, diameter: 14.3, circumference: 44.9, us: '3.5', uk: 'G' },
  { size: 6, diameter: 14.6, circumference: 45.9, us: '3.75', uk: 'G ½' },
  { size: 7, diameter: 15.0, circumference: 47.1, us: '4', uk: 'H ½' },
  { size: 8, diameter: 15.3, circumference: 48.1, us: '4.5', uk: 'I ½' },
  { size: 9, diameter: 15.6, circumference: 49.0, us: '5', uk: 'J ½' },
  { size: 10, diameter: 15.9, circumference: 50.0, us: '5.5', uk: 'K ½' },
  { size: 11, diameter: 16.2, circumference: 50.9, us: '5.75', uk: 'L' },
  { size: 12, diameter: 16.5, circumference: 51.8, us: '6', uk: 'L ½' },
  { size: 13, diameter: 16.8, circumference: 52.8, us: '6.5', uk: 'M ½' },
  { size: 14, diameter: 17.2, circumference: 54.0, us: '7', uk: 'O' },
  { size: 15, diameter: 17.5, circumference: 55.0, us: '7.5', uk: 'P' },
  { size: 16, diameter: 17.8, circumference: 55.9, us: '8', uk: 'Q' },
  { size: 17, diameter: 18.1, circumference: 56.9, us: '8.5', uk: 'R' },
  { size: 18, diameter: 18.4, circumference: 57.8, us: '9', uk: 'S' },
  { size: 19, diameter: 18.8, circumference: 59.1, us: '9.5', uk: 'S ½' },
  { size: 20, diameter: 19.1, circumference: 60.0, us: '10', uk: 'T ½' },
  { size: 21, diameter: 19.4, circumference: 60.9, us: '10.25', uk: 'U' },
  { size: 22, diameter: 19.7, circumference: 61.9, us: '10.5', uk: 'U ½' },
  { size: 23, diameter: 20.0, circumference: 62.8, us: '11', uk: 'V ½' },
  { size: 24, diameter: 20.3, circumference: 63.8, us: '11.25', uk: 'W' },
  { size: 25, diameter: 20.6, circumference: 64.7, us: '11.75', uk: 'X' },
  { size: 26, diameter: 21.0, circumference: 66.0, us: '12', uk: 'Z' },
  { size: 27, diameter: 21.3, circumference: 66.9, us: '12.5', uk: 'Z + 1' },
  { size: 28, diameter: 21.6, circumference: 67.9, us: '13', uk: 'Z + 2' },
  { size: 29, diameter: 22.0, circumference: 69.1, us: '13.5', uk: 'Z + 3' },
  { size: 30, diameter: 22.3, circumference: 70.1, us: '14', uk: 'Z + 4' }
];

export default function RingGuidePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'women' | 'men'
  const [activeMethod, setActiveMethod] = useState('diameter'); // 'diameter' | 'circumference'

  // Interactive Size Finder State
  const [finderInput, setFinderInput] = useState('');
  const [finderType, setFinderType] = useState('diameter'); // 'diameter' | 'circumference'
  const [matchedSize, setMatchedSize] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Compute closest match when user enters a measurement
  useEffect(() => {
    const val = parseFloat(finderInput);
    if (!val || isNaN(val) || val <= 0) {
      setMatchedSize(null);
      return;
    }

    let closest = null;
    let minDiff = Infinity;

    for (const item of RING_SIZE_DATA) {
      const target = finderType === 'diameter' ? item.diameter : item.circumference;
      const diff = Math.abs(target - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }

    // Only set matched size if reasonably close
    const maxThreshold = finderType === 'diameter' ? 3.0 : 8.0;
    if (minDiff <= maxThreshold) {
      setMatchedSize(closest);
    } else {
      setMatchedSize(null);
    }
  }, [finderInput, finderType]);

  // Filtered rows for the conversion table
  const filteredData = useMemo(() => {
    return RING_SIZE_DATA.filter(item => {
      // Category filter
      if (filterCategory === 'women' && (item.size < 6 || item.size > 16)) return false;
      if (filterCategory === 'men' && (item.size < 14 || item.size > 26)) return false;

      // Search term filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        String(item.size).includes(term) ||
        String(item.diameter).includes(term) ||
        String(item.circumference).includes(term) ||
        item.us.toLowerCase().includes(term) ||
        item.uk.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, filterCategory]);

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-32 sm:pt-36 lg:pt-40 pb-24 px-4 sm:px-6 lg:px-8 font-open-sans">
      
      {/* Decorative Background Glows */}
      <div className="max-w-6xl mx-auto relative z-10 space-y-12 sm:space-y-16">
        
        {/* BREADCRUMB NAVIGATION */}
        <nav className="flex items-center gap-2 text-xs text-[#9094A0] font-medium tracking-wider uppercase">
          <Link to="/" className="hover:text-[#E0B094] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[#E0B094]">Ring Size Guide</span>
        </nav>

        {/* HERO SECTION */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#E0B094]/60" />
            <span className="font-poppins text-xs sm:text-[13px] font-medium tracking-[0.28em] text-[#E0B094] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> PRECISION FIT & MEASUREMENT
            </span>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#E0B094]/60" />
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[0.04em] text-white leading-tight">
            Diamond Ring <span className="text-[#E0B094]">Size Guide</span>
          </h1>

          <p className="text-sm sm:text-base text-[#C5C8D0]/80 leading-relaxed font-light">
            Finding your perfect ring size ensures effortless comfort and timeless elegance. Use our two simple at-home measuring methods or cross-reference your measurements with the standard Indian diamond ring size chart.
          </p>

          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#E0B094] to-transparent mx-auto pt-2" />
        </div>

        {/* INTERACTIVE SIZE CALCULATOR / FINDER */}
        <div className="bg-gradient-to-b from-[#141620] to-[#0E1017] border border-[#E0B094]/30 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E0B094]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#E0B094] uppercase flex items-center justify-center gap-1.5">
                <Ruler className="w-4 h-4" /> Instant Size Calculator
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-semibold text-white tracking-wide">
                Calculate Your Indian Ring Size
              </h2>
              <p className="text-xs sm:text-sm text-[#9094A0]">
                Enter your measured finger circumference or an existing ring's inner diameter in millimeters (mm).
              </p>
            </div>

            {/* Input Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <div className="inline-flex p-1 bg-[#090A0E] border border-white/10 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => { setFinderType('diameter'); setFinderInput(''); }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-all ${
                    finderType === 'diameter' 
                      ? 'bg-[#E0B094] text-slate-950 font-semibold shadow-md' 
                      : 'text-[#C5C8D0] hover:text-white'
                  }`}
                >
                  Inner Diameter (mm)
                </button>
                <button
                  type="button"
                  onClick={() => { setFinderType('circumference'); setFinderInput(''); }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-all ${
                    finderType === 'circumference' 
                      ? 'bg-[#E0B094] text-slate-950 font-semibold shadow-md' 
                      : 'text-[#C5C8D0] hover:text-white'
                  }`}
                >
                  Circumference (mm)
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="90"
                  inputMode="decimal"
                  placeholder={finderType === 'diameter' ? 'e.g. 16.5' : 'e.g. 52.0'}
                  value={finderInput}
                  onChange={(e) => setFinderInput(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-[#090A0E] border border-white/20 focus:border-[#E0B094] rounded-lg text-white text-sm font-semibold placeholder:text-white/30 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#E0B094]/80 pointer-events-none">
                  mm
                </span>
              </div>
            </div>

            {/* Matched Size Result Card */}
            {matchedSize ? (
              <div className="mt-4 p-5 sm:p-6 bg-[#090A0E]/90 border border-[#E0B094]/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-14 h-14 rounded-full bg-[#E0B094]/15 border border-[#E0B094]/40 flex items-center justify-center shrink-0">
                    <span className="font-cinzel text-xl sm:text-2xl font-bold text-[#E0B094]">
                      {matchedSize.size}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider text-[#9094A0] uppercase block">
                      Recommended Indian Ring Size
                    </span>
                    <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                      Size {matchedSize.size} (India)
                    </h3>
                    <p className="text-xs text-[#C5C8D0]/80 mt-0.5">
                      Diameter: <strong className="text-white">{matchedSize.diameter} mm</strong> &bull; Circumference: <strong className="text-white">{matchedSize.circumference} mm</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-6 text-xs text-[#C5C8D0]">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-[#9094A0] uppercase block">USA / Canada</span>
                    <span className="font-semibold text-white text-sm">{matchedSize.us}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-[#9094A0] uppercase block">UK / Australia</span>
                    <span className="font-semibold text-white text-sm">{matchedSize.uk}</span>
                  </div>
                </div>
              </div>
            ) : finderInput ? (
              <p className="text-center text-xs text-[#E0B094]/80 italic">
                Please enter a standard millimeter value between 13mm–23mm (for diameter) or 40mm–71mm (for circumference).
              </p>
            ) : null}
          </div>
        </div>

        {/* TWO MEASURING METHODS SECTION */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#E0B094] uppercase">
              SIMPLE & PRECISE
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-medium text-white tracking-wide">
              How To Measure Your Ring Size At Home
            </h2>
            <p className="text-xs sm:text-sm text-[#9094A0] max-w-xl mx-auto">
              Follow either of these 2 foolproof methods using everyday household items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* METHOD 1: MEASURE AN EXISTING RING */}
            <div className="bg-[#12131A] border border-white/10 hover:border-[#E0B094]/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group">
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#E0B094]/10 border border-[#E0B094]/30 flex items-center justify-center text-[#E0B094] group-hover:scale-110 transition-transform">
                    <CircleDot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#E0B094] uppercase block">
                      METHOD 1 &bull; MOST ACCURATE
                    </span>
                    <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                      Measure an Existing Ring
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#C5C8D0]/80 leading-relaxed">
                  Best when you already own a ring that fits comfortably on the desired finger.
                </p>

                <ol className="space-y-3.5 text-xs sm:text-sm text-[#C5C8D0]/90">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#E0B094] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Select a ring that fits comfortably on the exact finger you intend to wear the new ring.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#E0B094] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Lay the ring flat over a millimeter (mm) ruler. Measure the <strong>inner diameter</strong> across the widest inside center (do <em>not</em> include the ring's outer metal thickness).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#E0B094] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Compare your millimeter measurement to the <strong>Diameter in mm</strong> column in the conversion chart below.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#E0B094]/90">
                <Info className="w-4 h-4 shrink-0" />
                <span>Tip: A standard Indian women's size is 12 (16.5 mm), and men's is 18 (18.4 mm).</span>
              </div>
            </div>

            {/* METHOD 2: MEASURE YOUR FINGER WITH PAPER / STRING */}
            <div className="bg-[#12131A] border border-white/10 hover:border-[#E0B094]/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group">
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#E0B094]/10 border border-[#E0B094]/30 flex items-center justify-center text-[#E0B094] group-hover:scale-110 transition-transform">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#E0B094] uppercase block">
                      METHOD 2 &bull; NO RING NEEDED
                    </span>
                    <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                      Measure Finger Circumference
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#C5C8D0]/80 leading-relaxed">
                  Best when you don't have a sample ring available and are measuring your finger directly.
                </p>

                <ol className="space-y-3.5 text-xs sm:text-sm text-[#C5C8D0]/90">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#E0B094] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Cut a thin strip of paper (around 1 cm wide) or take a non-stretchy piece of string.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#E0B094] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Wrap it snugly around the base of your finger. Ensure it slides comfortably over your knuckle. Mark the exact spot where the ends overlap with a fine pen.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[#E0B094] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Lay the strip flat against a ruler to measure the distance between marks in millimeters (mm). Match it with the <strong>Circumference in mm</strong> column.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#E0B094]/90">
                <Info className="w-4 h-4 shrink-0" />
                <span>Tip: Do not pull the paper too tightly; allow room for your knuckle to pass through.</span>
              </div>
            </div>

          </div>
        </div>

        {/* RING SIZE CONVERSION TABLE SECTION */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] text-[#E0B094] uppercase block mb-1">
                STANDARD CONVERSION MATRIX
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-medium text-white tracking-wide">
                Diamond Ring Size Chart
              </h2>
              <p className="text-xs sm:text-sm text-[#9094A0] mt-1">
                Indian Standard Sizes (1 to 30) with International Equivalents
              </p>
            </div>

            {/* Quick Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex p-1 bg-[#12131A] border border-white/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    filterCategory === 'all' 
                      ? 'bg-[#E0B094] text-slate-950 font-semibold' 
                      : 'text-[#C5C8D0] hover:text-white'
                  }`}
                >
                  All (1–30)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('women')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    filterCategory === 'women' 
                      ? 'bg-[#E0B094] text-slate-950 font-semibold' 
                      : 'text-[#C5C8D0] hover:text-white'
                  }`}
                >
                  Women's (6–16)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('men')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    filterCategory === 'men' 
                      ? 'bg-[#E0B094] text-slate-950 font-semibold' 
                      : 'text-[#C5C8D0] hover:text-white'
                  }`}
                >
                  Men's (14–26)
                </button>
              </div>

              <div className="relative w-44 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter size or mm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#12131A] border border-white/15 focus:border-[#E0B094] rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-[#12131A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#171922] border-b border-white/10 text-[11px] font-semibold text-[#E0B094] uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6 text-center">India Size</th>
                    <th className="py-4 px-4 sm:px-6">Inside Diameter (mm)</th>
                    <th className="py-4 px-4 sm:px-6">Inside Circumference (mm)</th>
                    <th className="py-4 px-4 sm:px-6">USA & Canada</th>
                    <th className="py-4 px-4 sm:px-6">UK, Australia & NZ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  {filteredData.length > 0 ? (
                    filteredData.map((row) => {
                      const isHighlighted = matchedSize && matchedSize.size === row.size;
                      return (
                        <tr 
                          key={row.size}
                          className={`transition-colors ${
                            isHighlighted 
                              ? 'bg-[#E0B094]/15 border-l-4 border-l-[#E0B094]' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-white">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E0B094]/15 text-[#E0B094] font-cinzel font-semibold">
                              {row.size}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#F5F5F0] font-medium">
                            {row.diameter.toFixed(1)} mm
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#F5F5F0] font-medium">
                            {row.circumference.toFixed(1)} mm
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#C5C8D0]">
                            {row.us}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#C5C8D0]">
                            {row.uk}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-xs text-[#9094A0]">
                        No matching ring sizes found for "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* EXPERT TIPS ACCORDION / GRID */}
        <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#E0B094]" />
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
              Essential Tips For A Flawless Fit
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs sm:text-sm text-[#C5C8D0]/80">
            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="text-[#E0B094]">✦</span> Temperature Matters
              </h4>
              <p className="leading-relaxed">
                Fingers tend to shrink in cooler temperatures and expand in warm weather or towards the end of the day. For the most accurate measurement, measure your finger at normal room temperature in the late afternoon.
              </p>
            </div>

            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="text-[#E0B094]">✦</span> The Knuckle Rule
              </h4>
              <p className="leading-relaxed">
                If your knuckle is noticeably wider than the base of your finger, measure both the knuckle and the finger base. Choose a size midway between the two so the ring slides over the knuckle comfortably without spinning loosely.
              </p>
            </div>

            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="text-[#E0B094]">✦</span> Wide Band Rings
              </h4>
              <p className="leading-relaxed">
                Rings with wide metal bands (wider than 5mm) fit more snugly on the finger than delicate solitaire bands. If purchasing a wide band design, consider sizing up by a half or full size for optimal comfort.
              </p>
            </div>

            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="text-[#E0B094]">✦</span> Buying a Surprise Gift?
              </h4>
              <p className="leading-relaxed">
                Borrow a ring that your recipient wears on the same intended finger and trace the inner diameter on paper, or slide it onto your own finger and mark where it comfortably stops.
              </p>
            </div>

            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="text-[#E0B094]">✦</span> Between Two Sizes?
              </h4>
              <p className="leading-relaxed">
                Whenever in doubt between two adjacent sizes, always choose the larger size. It is much easier to adjust a ring down slightly than to stretch a diamond-encrusted band.
              </p>
            </div>

            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="text-[#E0B094]">✦</span> Complimentary Resizing
              </h4>
              <p className="leading-relaxed">
                Diamoras offers lifetime complimentary resizing on all diamond rings purchased directly through our atelier, so you can shop with 100% confidence.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div className="relative p-8 sm:p-12 border border-[#E0B094]/30 rounded-2xl bg-gradient-to-br from-[#141620] via-[#10121A] to-[#0A0B0E] text-center overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="font-poppins text-xs font-semibold tracking-[0.28em] text-[#E0B094] uppercase block">
              DIAMORAS BESPOKE SERVICE
            </span>
            <h3 className="font-cinzel text-2xl sm:text-3xl font-medium text-white tracking-wide">
              Still Unsure About Your Ring Size?
            </h3>
            <p className="text-xs sm:text-sm text-[#C5C8D0]/80 leading-relaxed font-light">
              Our diamond jewellery specialists are happy to assist you personally with bespoke sizing advice, virtual consultations, or complimentary resizing assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-bold text-xs uppercase tracking-widest rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Explore Rings Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-7 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#E0B094]/50 text-white font-semibold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2"
              >
                Speak With a Specialist
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
