import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Diamond, Eye, X, Award, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CollectionShowcase({ onOpenShop }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchHomepageProducts();
  }, []);

  const fetchHomepageProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products', {
        params: { showInHomepage: true }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map(p => {
          const img1 = p.media && p.media.length > 0 
            ? (typeof p.media[0] === 'string' ? p.media[0] : p.media[0]?.url)
            : p.image || '/images/ring_hero.jpg';
          
          const img2 = p.media && p.media.length > 1 
            ? (typeof p.media[1] === 'string' ? p.media[1] : p.media[1]?.url)
            : p.hoverImage || null;

          const rawPrice = p.grandTotal || p.computedGoldPrice || p.price;
          const formattedPrice = rawPrice ? `RS. ${Number(rawPrice).toLocaleString('en-IN')}` : 'RS. 0';

          return {
            id: p.id || `prod-${Math.random()}`,
            title: p.title || 'EXCLUSIVE JEWELRY',
            price: formattedPrice,
            image: img1,
            hoverImage: img2,
            category: p.categoryTitle || p.collectionTitle || 'JEWELRY',
            metal: p.purityTitle || p.colorTitle || '18K Gold',
            description: p.descriptionHtml || p.description || 'Handcrafted fine jewelry piece.'
          };
        });
        setProducts(formatted);
      }
    } catch (err) {
      console.error('Error fetching homepage products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="collection" className="relative pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-12 bg-[#0A0B0E] text-[#F5F5F0] select-none z-20">
      
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

        {/* FLEXBOX PRODUCT GRID - CENTERED FOR PARTIAL BOTTOM ROWS */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-16">
            {[...Array(8)].map((_, idx) => (
              <div key={`skel-${idx}`} className="flex flex-col items-center w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.75rem)] max-w-[280px] shrink-0">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#12131A] border border-white/10 p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
                  <div className="w-full h-full rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                  </div>
                </div>
                <div className="mt-3.5 text-center px-2 w-full flex flex-col items-center gap-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[#E0B094]/20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-16">
            {products.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => navigate(`/product/${item.id}`)}
                className="group cursor-pointer flex flex-col items-center w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.75rem)] max-w-[280px] shrink-0"
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

                {/* Product Title & Price */}
                <div className="mt-3.5 text-center px-1 w-full">
                  <h3 className="font-cinzel font-semibold text-xs sm:text-[13px] tracking-[0.1em] text-[#F5F5F0] uppercase truncate group-hover:text-[#E0B094] transition-colors leading-tight mb-1" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="font-poppins font-medium text-xs sm:text-[13px] text-[#E0B094] tracking-wider">
                    {item.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CENTERED "VIEW ALL PRODUCTS" BUTTON */}
        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              if (onOpenShop) onOpenShop();
              navigate('/shop');
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
                      navigate('/shop');
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
