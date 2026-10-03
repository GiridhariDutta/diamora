import React from 'react';

export default function HeroSectionUI({ onOpenShop }) {
  // Static image paths from the public folder
  const desktopImg = '/images/desktop_hero_section_1.png';
  const mobileImg = '/images/mobile_hero_section_1.png';

  const handleClick = (e) => {
    if (onOpenShop) {
      onOpenShop(e);
      return;
    }
    const collectionSection = document.getElementById('collection');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-[#0C0D10] pt-[64px] sm:pt-[69px] select-none">
      
      {/* Desktop Full-Screen Image */}
      <img 
        src={desktopImg} 
        alt="Diamora Collection Desktop" 
        className="hidden sm:block w-full h-auto object-contain"
      />
      
      {/* Mobile Full-Screen Image */}
      <img 
        src={mobileImg} 
        alt="Diamora Collection Mobile" 
        className="block sm:hidden w-full h-auto object-contain"
      />

      {/* Clickable transparent overlay covering the entire image */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer mt-[64px] sm:mt-[69px]"
        onClick={handleClick}
        title="Explore Collection"
      />

    </div>
  );
}
