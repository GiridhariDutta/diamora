import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Diamond, Eye, X, Award, ShieldCheck } from 'lucide-react';

export default function CollectionShowcase({ onOpenShop }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const curatedProducts = [
    {
      id: 'aadhavi-stud',
      title: 'AADHAVI DIAMOND STUD',
      price: 'RS. 39,672',
      image: '/images/Diamond_stud_earrings_in_setting_202608261741.jpeg',
      hoverImage: '/images/Woman_wearing_diamond_stud_earrings_202608261740.jpeg',
      category: 'EARRINGS',
      metal: '18K Rose Gold',
      description: 'Handcrafted rose gold twisted studs set with brilliant round cut certified natural diamonds.'
    },
    {
      id: 'aadya-studs',
      title: 'AADYA DIAMOND STUDS',
      price: 'RS. 46,448',
      image: '/images/Diamond_drop_earrings_displayed_202608261740.jpeg',
      hoverImage: '/images/Woman_wearing_diamond_drop_earrings_202608261759.jpeg',
      category: 'EARRINGS',
      metal: '18K White Gold',
      description: 'Square cluster white gold diamond studs engineered for maximum light refraction.'
    },
    {
      id: 'ahalya-nose-pin',
      title: 'AHALYA DIAMOND NOSE PIN',
      price: 'RS. 21,450',
      image: '/images/Diamond_nose_ring_close_up_202608261801.jpeg',
      hoverImage: '/images/Woman_wearing_diamond_nose_ring_202608261801.jpeg',
      category: 'NOSE PINS',
      metal: 'Platinum 950',
      description: 'A delicate single-row eternity solitaire nose ring crafted in pure platinum 950.'
    },
    {
      id: 'aisha-nose-pin',
      title: 'AISHA DIAMOND NOSE PIN',
      price: 'RS. 23,335',
      image: '/images/Diamond_Nath_product_photography_202608261800.jpeg',
      hoverImage: '/images/Woman_wearing_ornate_diamond_Nath_202608261801.jpeg',
      category: 'NOSE PINS',
      metal: '18K Yellow Gold',
      description: 'Solid yellow gold huggie pin encrusted with three micro-paved brilliant diamonds.'
    },
    {
      id: 'royal-earrings',
      title: 'ROYAL SOLITAIRE EARRINGS',
      price: 'RS. 52,180',
      image: '/images/Diamond_hoop_earrings_displayed_202608261741.jpeg',
      hoverImage: '/images/Woman_wearing_diamond_earrings_202608261739.jpeg',
      category: 'HIGH JEWELRY',
      metal: 'Platinum 950',
      description: 'Timeless solitaire drop earrings featuring 2.0 total carat collection quality diamonds.'
    },
    {
      id: 'ceylon-band',
      title: 'CEYLON SAPPHIRE BAND',
      price: 'RS. 34,900',
      image: '/images/Diamond_bangle_product_shot_202608271248.jpeg',
      hoverImage: '/images/Diamond_cuff_bracelet_photography_202608271248.jpeg',
      category: 'RINGS',
      metal: '18K White Gold',
      description: 'Velvety unheated Sri Lankan royal blue sapphire set between white diamond pave shoulders.'
    },
    {
      id: 'venetian-drop',
      title: 'VENETIAN DIAMOND DROP',
      price: 'RS. 28,750',
      image: '/images/necklace_hero.jpg',
      hoverImage: '/images/Diamond_drop_earrings_displayed_202608261741.jpeg',
      category: 'NECKLACES',
      metal: '18K Gold',
      description: 'Cascading Venetian chain link pendant adorned with brilliant round solitaire diamonds.'
    },
    {
      id: 'marquise-flora',
      title: 'MARQUISE FLORA RING',
      price: 'RS. 41,200',
      image: '/images/Diamond_nose_stud_floral_cluster_202608261759.jpeg',
      hoverImage: '/images/Woman_wearing_diamond_nose_stud_202608261801.jpeg',
      category: 'RINGS',
      metal: '18K Rose Gold',
      description: 'Botanical flora ring set with marquise cut diamonds mirroring blooming petals.'
    }
  ];

  return (
    <section id="collection" className="relative pt-6 sm:pt-10 pb-20 sm:pb-28 px-4 sm:px-8 lg:px-12 bg-[#0A0B0E] text-[#F5F5F0] select-none z-20">
      
      {/* Background Hairline Gridlines */}
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-30 z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header (Matching Reference Image) */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          {/* Eyebrow */}
          <span className="font-poppins text-xs sm:text-[13px] font-medium tracking-[0.28em] text-[#E0B094] uppercase block">
            OUR COLLECTION
          </span>

          {/* Sparkle Star Divider Line */}
          <div className="flex items-center justify-center gap-3 my-2.5 opacity-85">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#E0B094]" />
            <span className="text-[#E0B094] text-[10px]">✦</span>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#E0B094]" />
          </div>

          {/* Main Headline */}
          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[0.04em] text-[#F5F5F0] leading-tight drop-shadow-[0_2px_15px_rgba(224,176,148,0.2)]">
            Crafted to Perfection
          </h2>
        </div>

        {/* 4-COLUMN PRODUCT GRID WITH DUAL HOVER IMAGE SWITCHING & SMOOTH ZOOM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
          {curatedProducts.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => setSelectedProduct(item)}
              className="group cursor-pointer flex flex-col items-center"
            >
              {/* Square Product Image Frame */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#12131A] border border-white/10 p-2.5 transition-all duration-300 group-hover:border-[#E0B094]/70 group-hover:shadow-[0_12px_35px_rgba(0,0,0,0.85)]">
                <div className="w-full h-full rounded-xl overflow-hidden bg-black relative">
                  
                  {/* Primary Thumbnail Image with Zoom */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover filter brightness-105 contrast-110 group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Secondary Hover Image (Instant Crossfade on Hover if present) */}
                  {item.hoverImage && (
                    <img
                      src={item.hoverImage}
                      alt={`${item.title} alternate view`}
                      className="absolute inset-0 w-full h-full object-cover filter brightness-105 contrast-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-105 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity z-10" />
                  
                  {/* Quick Preview Badge */}
                  <div className="absolute bottom-3 right-3 p-2 rounded-full bg-black/75 border border-white/20 text-[#E0B094] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Product Title & Price (Matching Reference Layout) */}
              <div className="mt-3.5 text-center px-2">
                <h3 className="font-cinzel font-semibold text-xs sm:text-[13px] tracking-[0.12em] text-[#F5F5F0] uppercase truncate group-hover:text-[#E0B094] transition-colors leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="font-poppins font-medium text-xs sm:text-[13px] text-[#E0B094] tracking-wider">
                  {item.price}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CENTERED "VIEW ALL PRODUCTS" BUTTON */}
        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              if (onOpenShop) onOpenShop();
            }}
            className="group font-poppins px-9 py-4 rounded-full border border-[#E0B094]/80 hover:border-[#E0B094] bg-black/80 hover:bg-[#E0B094]/15 text-[#E0B094] font-semibold text-xs sm:text-sm tracking-[0.22em] uppercase transition-all duration-300 flex items-center gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

      </div>

      {/* Product Modal Lightbox */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl border border-[#E0B094]/40 bg-[#12131A] p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full border border-white/20 bg-black/70 text-white hover:bg-[#E0B094] hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-poppins font-semibold text-[#E0B094] tracking-widest uppercase block mb-1">
                      {selectedProduct.category} — {selectedProduct.metal}
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">
                      {selectedProduct.title}
                    </h3>
                    <p className="font-poppins text-lg font-bold text-[#E0B094] mb-4">
                      {selectedProduct.price}
                    </p>
                    <p className="font-open-sans text-xs text-[#9B9EA7] leading-relaxed mb-6">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      if (onOpenShop) onOpenShop();
                    }}
                    className="w-full py-3 rounded-full bg-[#E0B094] hover:bg-[#F7E09A] text-black font-poppins font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(224,176,148,0.3)]"
                  >
                    <span>BUY NOW / INQUIRE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
