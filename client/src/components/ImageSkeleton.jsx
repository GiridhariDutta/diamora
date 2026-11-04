import React from 'react';

/**
 * ImageSkeleton
 * Ultra-clean luxury diagonal shimmer loader for Diamora.
 * Corner-angled metallic light sweep with responsive 1.2s speed.
 * Clean, uninterrupted surface with zero center icons as requested.
 */
export default function ImageSkeleton({ className = '', rounded = '' }) {
  return (
    <div className={`absolute inset-0 bg-[#16181F] overflow-hidden pointer-events-none z-10 ${rounded} ${className}`}>
      {/* Corner-angled champagne/gold metallic shimmer beam */}
      <div 
        className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 20%, rgba(224,176,148,0.13) 50%, rgba(255,255,255,0.02) 80%, transparent 100%)'
        }}
      />
    </div>
  );
}
