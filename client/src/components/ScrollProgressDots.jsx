import React from 'react';
import { motion } from 'framer-motion';

export default function ScrollProgressDots({ currentScene, totalScenes = 4, onSelectScene }) {
  const sceneLabels = ['OVERVIEW', 'SOLITAIRE', 'GEMOLOGY', 'CRAFTSMANSHIP'];

  return (
    <div className="fixed left-6 lg:left-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-6 pointer-events-auto">
      
      {/* Thin Vertical Progress Track */}
      <div className="relative flex flex-col items-center gap-4">
        {Array.from({ length: totalScenes }).map((_, idx) => {
          const isActive = currentScene === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectScene(idx)}
              className="group relative flex items-center focus:outline-none py-1.5"
              aria-label={`Jump to scene ${idx + 1}`}
            >
              {/* Active Indicator: Thin Blue Line Bar or Dot */}
              <div className="relative flex items-center justify-center">
                {isActive ? (
                  <motion.div
                    layoutId="activeSceneBarLuxe"
                    className="w-[3px] h-9 bg-[#3B6EF5] rounded-full shadow-[0_0_12px_#3B6EF5]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/60 transition-all duration-300 group-hover:scale-125" />
                )}
              </div>

              {/* Hover Tooltip Label */}
              <span className="absolute left-8 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none text-[10px] font-mono tracking-[0.25em] text-[#9B9B9B] group-hover:text-white uppercase whitespace-nowrap bg-[#121214]/90 px-3 py-1 rounded border border-white/10 glass-panel">
                0{idx + 1} — {sceneLabels[idx]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Numerical Counter "01 / 04" */}
      <div className="text-[10px] font-mono tracking-widest text-[#9B9B9B] mt-2 flex flex-col items-center">
        <span className="text-[#F5F5F0] font-bold text-xs">0{currentScene + 1}</span>
        <span className="w-4 h-[1px] bg-white/20 my-1" />
        <span>0{totalScenes}</span>
      </div>
    </div>
  );
}
