import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { 
  Sparkles, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight,
  Loader2, 
  Video,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react';
import api from '../api/axios';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onOpenShop, onOpenInquiry } = useOutletContext() || {};

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [error, setError] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const scrollRef = useRef(null);
  const recentlyScrollRef = useRef(null);

  const handleInquireClick = (targetProduct = null) => {
    const prodToInquire = targetProduct || product;
    if (onOpenInquiry && prodToInquire) {
      onOpenInquiry(prodToInquire);
    } else if (onOpenShop) {
      onOpenShop();
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleScrollRecentlyLeft = () => {
    if (recentlyScrollRef.current) {
      recentlyScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRecentlyRight = () => {
    if (recentlyScrollRef.current) {
      recentlyScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Client-side localStorage Recently Viewed tracker
  useEffect(() => {
    if (product && (product.id || product._id)) {
      const prodId = product.id || product._id;
      const currentItem = {
        id: prodId,
        _id: prodId,
        title: product.title || '',
        sku: product.sku || '',
        categoryTitle: product.categoryTitle || '',
        colorTitle: product.colorTitle || '',
        purityTitle: product.purityTitle || '',
        price: Number(product.grandTotal || product.computedGoldPrice || product.price || 0),
        imageUrl: product.media?.[0]?.url || product.imageUrl || product.primaryImage || '',
        secondaryImageUrl: product.media?.[1]?.url || ''
      };

      try {
        const stored = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
        const filtered = Array.isArray(stored) ? stored.filter(p => (p.id || p._id) !== prodId) : [];
        setRecentlyViewed(filtered);

        const updated = [currentItem, ...filtered].slice(0, 10);
        localStorage.setItem('recently_viewed_products', JSON.stringify(updated));
      } catch (err) {
        console.error('Error with recently viewed storage:', err);
      }
    }
  }, [product]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/products/${id}`);
      if (res.data?.success && res.data.data) {
        const fetchedProd = res.data.data;
        setProduct(fetchedProd);
        setActiveMediaIndex(0);
        // Fetch matching similar products
        fetchSimilarProducts(fetchedProd);
      } else {
        setError('Product not found or unavailable.');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  // Algorithm to fetch & rank similar products by Category, Color, and Price proximity
  const fetchSimilarProducts = async (currentProd) => {
    setLoadingSimilar(true);
    try {
      const res = await api.get('/api/products?limit=100');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const allProds = res.data.data.filter(p => (p.id || p._id) !== (currentProd.id || currentProd._id));
        
        const currentPrice = Number(currentProd.grandTotal || currentProd.computedGoldPrice || currentProd.price || 0);

        // Score products based on category match, color match, and price difference
        const scoredProds = allProds.map(p => {
          let score = 0;
          
          // 1. Same Category match (Highest Priority)
          const isSameCategory = 
            (p.categoryTitle && currentProd.categoryTitle && p.categoryTitle.toLowerCase() === currentProd.categoryTitle.toLowerCase()) ||
            (p.categoryRefId && currentProd.categoryRefId && p.categoryRefId === currentProd.categoryRefId) ||
            (p.category && currentProd.category && p.category === currentProd.category);

          if (isSameCategory) {
            score += 1000;
          }

          // 2. Same Metal Color match (Secondary Priority)
          const isSameColor = 
            (p.colorTitle && currentProd.colorTitle && p.colorTitle.toLowerCase() === currentProd.colorTitle.toLowerCase()) ||
            (p.colorRefId && currentProd.colorRefId && p.colorRefId === currentProd.colorRefId) ||
            (p.selectedColor && currentProd.selectedColor && p.selectedColor.toLowerCase() === currentProd.selectedColor.toLowerCase());

          if (isSameColor) {
            score += 500;
          }

          // 3. Price proximity (Lower price difference gets higher score)
          const itemPrice = Number(p.grandTotal || p.computedGoldPrice || p.price || 0);
          const priceDiff = Math.abs(itemPrice - currentPrice);

          // Deduct normalized price difference
          score -= priceDiff / 1000;

          return {
            ...p,
            _score: score,
            _priceDiff: priceDiff,
            _itemPrice: itemPrice,
            _isSameCategory: isSameCategory,
            _isSameColor: isSameColor
          };
        });

        // Sort by calculated score descending (highest score first)
        scoredProds.sort((a, b) => b._score - a._score);

        // Take top matching similar items (up to 10)
        setSimilarProducts(scoredProds.slice(0, 10));
      }
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setSimilarProducts([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 pb-12 flex flex-col items-center justify-center font-poppins">
        <Loader2 className="w-7 h-7 animate-spin text-[#E0B094] mb-2" />
        <p className="text-xs text-[#C5C8D0] uppercase tracking-widest font-normal">Loading Masterpiece Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 pb-12 font-poppins flex flex-col items-center justify-center text-center px-4">
        <Sparkles className="w-8 h-8 text-[#E0B094] mb-2 opacity-60" />
        <h2 className="text-base font-normal text-white uppercase tracking-wider mb-2">Masterpiece Not Found</h2>
        <p className="text-xs text-[#C5C8D0] max-w-md mb-4 font-light">{error || 'The requested product could not be located.'}</p>
        <Link
          to="/shop"
          className="px-5 py-2 bg-[#E0B094] text-[#0C0D10] text-xs font-medium uppercase tracking-widest rounded-md hover:bg-[#d5a082] transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </Link>
      </div>
    );
  }

  const mediaList = product.media && product.media.length > 0
    ? product.media
    : [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', type: 'image' }];

  const activeMedia = mediaList[activeMediaIndex] || mediaList[0];
  const formattedPrice = Number(product.grandTotal || product.computedGoldPrice || product.price || 0).toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-22 pb-16 font-poppins">
      <div className="w-[95vw] max-w-[1500px] mx-auto px-3 sm:px-5">
        
        {/* BREADCRUMB & BACK BUTTON */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-normal text-[#E0B094] hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#C5C8D0] uppercase tracking-wider font-light">
            <Link to="/" className="hover:text-[#E0B094]">HOME</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#E0B094]">SHOP</Link>
            {product.categoryTitle && (
              <>
                <span>/</span>
                <span className="text-[#E0B094] font-normal">{product.categoryTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* MAIN PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: STICKY MEDIA GALLERY WITH THUMBNAILS ON LEFT SIDE */}
          <div className="lg:col-span-6 sticky top-28 self-start flex flex-col-reverse sm:flex-row gap-3 items-start z-20">
            
            {/* Vertical Thumbnail Navigation Column (Left Side) */}
            {mediaList.length > 1 && (
              <div className="flex sm:flex-col items-center gap-2 overflow-x-auto sm:overflow-y-auto max-h-[480px] w-full sm:w-20 shrink-0 scrollbar-none">
                {mediaList.map((item, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#16181F] rounded-md overflow-hidden border transition-all cursor-pointer ${
                      activeMediaIndex === idx
                        ? 'border-[#E0B094] ring-1 ring-[#E0B094]/50 shadow-md'
                        : 'border-white/15 hover:border-white/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-[#E0B094]">
                        <Video className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] uppercase font-normal text-slate-300">Video</span>
                      </div>
                    ) : (
                      <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Preview */}
            <div className="flex-1 w-full bg-[#16181F] border border-white/15 rounded-xl overflow-hidden relative shadow-xl aspect-square sm:aspect-[4/3] flex items-center justify-center">
              {activeMedia.type === 'video' ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={product.title}
                  className="w-full h-full object-contain p-2"
                />
              )}

              {/* SKU Badge */}
              <div className="absolute top-3 left-3 bg-[#0C0D10]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-[#E0B094]">
                SKU: {product.sku || 'DIAM-VAULT'}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SCROLLABLE PRODUCT DETAILS & SPECS */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* CATEGORY & TITLE */}
            <div>
              {product.categoryTitle && (
                <span className="inline-block px-2.5 py-0.5 bg-[#E0B094]/15 border border-[#E0B094]/30 text-[#E0B094] text-[10px] font-medium tracking-widest uppercase rounded-full mb-1.5">
                  {product.categoryTitle}
                </span>
              )}

              <h1 className="font-serif text-2xl sm:text-3xl font-light text-white leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#C5C8D0] font-light">
                <span>Ref: <strong className="font-mono text-white">{product.sku || product.id}</strong></span>
                {product.purityTitle && (
                  <>
                    <span>•</span>
                    <span className="text-[#E0B094]">{product.purityTitle}</span>
                  </>
                )}
                {product.colorTitle && (
                  <>
                    <span>•</span>
                    <span className="text-[#E0B094]">{product.colorTitle}</span>
                  </>
                )}
              </div>
            </div>

            {/* PRICE & BREAKDOWN BOX */}
            <div className="bg-[#16181F]/80 border border-white/15 rounded-lg p-4 space-y-2 backdrop-blur-xl">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#C5C8D0] font-normal uppercase tracking-wider">Total Price</span>
                <span className="font-mono text-2xl sm:text-3xl font-normal text-[#E0B094]">
                  ₹{formattedPrice}
                </span>
              </div>

              {/* Price Components */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#C5C8D0]/80 uppercase block">Gold Weight</span>
                  <span className="font-mono text-white font-normal">{product.metalWeight || 0}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#C5C8D0]/80 uppercase block">Gold Rate</span>
                  <span className="font-mono text-white font-normal">₹{product.goldRate || 0}/g</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#C5C8D0]/80 uppercase block">Diamond Weight</span>
                  <span className="font-mono text-white font-normal">{product.diamondWeight || 0} ct</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#C5C8D0]/80 uppercase block">GST Tax</span>
                  <span className="font-mono text-white font-normal">{product.gstPercentage || 3}%</span>
                </div>
              </div>
            </div>

            {/* METAL TYPE AND COLOUR OPTIONS (IF PROVIDED) */}
            {(product.purityTitle || product.colorTitle) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {product.purityTitle && (
                  <div className="space-y-1.5">
                    <label className="block text-xs text-[#C5C8D0] font-normal tracking-wide">
                      Metal Purity:
                    </label>
                    <div className="inline-block px-4 py-2 bg-white/5 border border-white/20 text-[#F5F5F0] text-xs font-normal rounded-md shadow-2xs">
                      {product.purityTitle}
                    </div>
                  </div>
                )}

                {product.colorTitle && (
                  <div className="space-y-1.5">
                    <label className="block text-xs text-[#C5C8D0] font-normal tracking-wide">
                      Metal Colour:
                    </label>
                    <div className="inline-block px-4 py-2 bg-white/5 border border-white/20 text-[#F5F5F0] text-xs font-normal rounded-md shadow-2xs">
                      {product.colorTitle}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCT DESCRIPTION SECTION */}
            <div className="bg-[#16181F]/80 border border-white/15 rounded-lg p-4 space-y-2 backdrop-blur-xl">
              <span className="text-xs font-normal tracking-[0.18em] text-[#E0B094] uppercase block border-b border-white/10 pb-1.5">
                Description & Details
              </span>

              {product.descriptionHtml ? (
                <div 
                  className="text-xs leading-relaxed text-[#C5C8D0] font-light space-y-1 [&_h1]:text-sm [&_h1]:font-normal [&_h1]:text-white [&_h2]:text-xs [&_h2]:font-normal [&_h2]:text-white [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
                />
              ) : (
                <p className="text-xs text-[#C5C8D0]/70 font-light italic">
                  Crafted with precision in certified gold and handselected diamonds.
                </p>
              )}
            </div>

            {/* ACTION BUTTONS (SINGLE HORIZONTAL ROW) */}
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleInquireClick()}
                className="flex-1 w-full py-2.5 bg-[#E0B094] hover:bg-[#d5a082] text-[#0C0D10] font-medium text-[11px] sm:text-xs tracking-[0.12em] uppercase rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="truncate">Inquire / Request Appointment</span>
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="flex-1 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-normal text-[11px] sm:text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E0B094] shrink-0" />
                <span className="truncate">Explore Full Collection</span>
              </button>
            </div>

          </div>
        </div>

        {/* SIMILAR PRODUCTS SECTION (HORIZONTAL ROW WITH ARROW CONTROLS & SWIPE) */}
        {similarProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/10 space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#E0B094] tracking-[0.25em] uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E0B094]" />
                  <span>SIMILAR MASTERPIECES</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                  You May Also <span className="italic text-[#E0B094] font-normal">Admire</span>
                </h3>
              </div>

              {/* Left / Right Arrow Scroll Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleScrollLeft}
                  className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-[#E0B094] hover:text-[#0C0D10] text-white transition-all shadow-md cursor-pointer active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleScrollRight}
                  className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-[#E0B094] hover:text-[#0C0D10] text-white transition-all shadow-md cursor-pointer active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Product Row */}
            <div 
              ref={scrollRef}
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-1"
              style={{ scrollBehavior: 'smooth' }}
            >
              {similarProducts.map((item) => {
                const itemPrimaryImg = 
                  item.media?.[0]?.url || 
                  item.imageUrl || 
                  item.primaryImage || 
                  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';

                const itemSecondaryImg = item.media?.[1]?.url || null;
                const itemPrice = Number(item.grandTotal || item.computedGoldPrice || item.price || 0);

                return (
                  <div
                    key={item.id || item._id}
                    onClick={() => navigate(`/product/${item.id || item._id}`)}
                    className="w-[230px] sm:w-[270px] shrink-0 snap-start bg-[#16181F]/90 border border-white/10 hover:border-[#E0B094]/60 rounded-2xl p-3.5 transition-all duration-300 group shadow-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container with Hover Crossfade */}
                      <div className="h-48 sm:h-52 w-full rounded-xl overflow-hidden relative bg-[#0C0D10] mb-3">
                        <img
                          src={itemPrimaryImg}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {itemSecondaryImg && (
                          <img
                            src={itemSecondaryImg}
                            alt={`${item.title} Cover`}
                            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          {item.categoryTitle && (
                            <span className="px-2 py-0.5 rounded-full bg-[#0C0D10]/80 backdrop-blur-md border border-white/15 text-[9px] font-mono text-[#E0B094] uppercase truncate max-w-[120px]">
                              {item.categoryTitle}
                            </span>
                          )}

                          {item.colorTitle && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[9px] font-mono text-gray-200 uppercase shrink-0">
                              {item.colorTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Title */}
                      <h4 className="font-serif text-sm font-semibold text-white group-hover:text-[#E0B094] transition-colors truncate mb-1">
                        {item.title}
                      </h4>

                      {/* SKU & Purity */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mb-2">
                        <span>{item.sku || 'DIAM-VAULT'}</span>
                        {item.purityTitle && (
                          <>
                            <span>•</span>
                            <span className="text-[#E0B094]">{item.purityTitle}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer Row: Price & Action */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase block font-mono">ESTIMATED PRICE</span>
                        <span className="font-mono text-sm font-bold text-[#E0B094]">
                          ₹{itemPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInquireClick(item);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-[#E0B094] hover:text-[#0C0D10] text-[#E0B094] border border-white/15 transition-colors cursor-pointer"
                        title="Inquire for this item"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED SECTION (CLIENT-SIDE LOCALSTORAGE, SHOWN ONLY IF HISTORY EXISTS) */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/10 space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#E0B094] tracking-[0.25em] uppercase mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#E0B094]" />
                  <span>RECENTLY VIEWED</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                  Your Browsing <span className="italic text-[#E0B094] font-normal">History</span>
                </h3>
              </div>

              {/* Left / Right Arrow Scroll Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleScrollRecentlyLeft}
                  className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-[#E0B094] hover:text-[#0C0D10] text-white transition-all shadow-md cursor-pointer active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleScrollRecentlyRight}
                  className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-[#E0B094] hover:text-[#0C0D10] text-white transition-all shadow-md cursor-pointer active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Product Row */}
            <div 
              ref={recentlyScrollRef}
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-1"
              style={{ scrollBehavior: 'smooth' }}
            >
              {recentlyViewed.map((item) => {
                const itemPrimaryImg = 
                  item.imageUrl || 
                  item.media?.[0]?.url || 
                  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';

                const itemSecondaryImg = item.secondaryImageUrl || item.media?.[1]?.url || null;
                const itemPrice = Number(item.price || item.grandTotal || 0);

                return (
                  <div
                    key={`recent-${item.id || item._id}`}
                    onClick={() => navigate(`/product/${item.id || item._id}`)}
                    className="w-[230px] sm:w-[270px] shrink-0 snap-start bg-[#16181F]/90 border border-white/10 hover:border-[#E0B094]/60 rounded-2xl p-3.5 transition-all duration-300 group shadow-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container with Hover Crossfade */}
                      <div className="h-48 sm:h-52 w-full rounded-xl overflow-hidden relative bg-[#0C0D10] mb-3">
                        <img
                          src={itemPrimaryImg}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {itemSecondaryImg && (
                          <img
                            src={itemSecondaryImg}
                            alt={`${item.title} Cover`}
                            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          {item.categoryTitle && (
                            <span className="px-2 py-0.5 rounded-full bg-[#0C0D10]/80 backdrop-blur-md border border-white/15 text-[9px] font-mono text-[#E0B094] uppercase truncate max-w-[120px]">
                              {item.categoryTitle}
                            </span>
                          )}

                          {item.colorTitle && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[9px] font-mono text-gray-200 uppercase shrink-0">
                              {item.colorTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Title */}
                      <h4 className="font-serif text-sm font-semibold text-white group-hover:text-[#E0B094] transition-colors truncate mb-1">
                        {item.title}
                      </h4>

                      {/* SKU & Purity */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mb-2">
                        <span>{item.sku || 'DIAM-VAULT'}</span>
                        {item.purityTitle && (
                          <>
                            <span>•</span>
                            <span className="text-[#E0B094]">{item.purityTitle}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer Row: Price & Action */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase block font-mono">ESTIMATED PRICE</span>
                        <span className="font-mono text-sm font-bold text-[#E0B094]">
                          ₹{itemPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInquireClick(item);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-[#E0B094] hover:text-[#0C0D10] text-[#E0B094] border border-white/15 transition-colors cursor-pointer"
                        title="Inquire for this item"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
