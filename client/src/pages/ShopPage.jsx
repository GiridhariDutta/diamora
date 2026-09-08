import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Sparkles, ShoppingBag, SlidersHorizontal, Loader2, ChevronDown } from 'lucide-react';
import api from '../api/axios';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { onOpenShop } = useOutletContext() || {};

  // Master Data States
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [colors, setColors] = useState([]);
  const [purities, setPurities] = useState([]);

  // Accordion Expand/Collapse States
  const [openSections, setOpenSections] = useState({
    category: true,
    collection: true,
    color: true,
    purity: true,
    price: true
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Products & Lazy Loading States
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);

  // Active Filter States
  const activeCategoryParam = searchParams.get('category') || '';
  const activeCollectionParam = searchParams.get('collection') || '';
  const activeColorParam = searchParams.get('color') || '';
  const activePurityParam = searchParams.get('purity') || '';
  const activePriceParam = searchParams.get('price') || '';

  const [selectedCategory, setSelectedCategory] = useState(activeCategoryParam);
  const [selectedCollection, setSelectedCollection] = useState(activeCollectionParam);
  const [selectedColor, setSelectedColor] = useState(activeColorParam);
  const [selectedPurity, setSelectedPurity] = useState(activePurityParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState(activePriceParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sentinelRef = useRef(null);
  const BATCH_LIMIT = 12;

  // Sync state with URL search parameters
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedCollection(searchParams.get('collection') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedPurity(searchParams.get('purity') || '');
    setSelectedPriceRange(searchParams.get('price') || '');
  }, [searchParams]);

  // Fetch Master Data once (Categories, Collections, Colors, Purities)
  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    setMasterLoading(true);
    try {
      const [catRes, colRes, clrRes, purRes] = await Promise.allSettled([
        api.get('/api/categories'),
        api.get('/api/collections'),
        api.get('/api/colors'),
        api.get('/api/purities')
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.success) setCategories(catRes.value.data.data);
      if (colRes.status === 'fulfilled' && colRes.value.data?.success) setCollections(colRes.value.data.data);
      if (clrRes.status === 'fulfilled' && clrRes.value.data?.success) setColors(clrRes.value.data.data);
      if (purRes.status === 'fulfilled' && purRes.value.data?.success) setPurities(purRes.value.data.data);
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setMasterLoading(false);
    }
  };

  // Fetch initial batch (Page 1) when active filters change
  useEffect(() => {
    fetchInitialProducts();
  }, [selectedCategory, selectedCollection, selectedColor, selectedPurity, selectedPriceRange]);

  const fetchInitialProducts = async () => {
    setLoadingInitial(true);
    setPage(1);
    try {
      const params = {
        page: 1,
        limit: BATCH_LIMIT,
        category: selectedCategory,
        collection: selectedCollection,
        color: selectedColor,
        purity: selectedPurity,
        price: selectedPriceRange
      };

      const res = await api.get('/api/products', { params });
      if (res.data?.success) {
        setProducts(res.data.data || []);
        if (res.data.pagination) {
          setHasNextPage(Boolean(res.data.pagination.hasNextPage));
          setTotalItems(res.data.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching products batch 1:', err);
      setProducts([]);
    } finally {
      setLoadingInitial(false);
    }
  };

  // Fetch next batch for infinite scroll
  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasNextPage || loadingInitial) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const params = {
        page: nextPage,
        limit: BATCH_LIMIT,
        category: selectedCategory,
        collection: selectedCollection,
        color: selectedColor,
        purity: selectedPurity,
        price: selectedPriceRange
      };

      const res = await api.get('/api/products', { params });
      if (res.data?.success) {
        const newProducts = res.data.data || [];
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        if (res.data.pagination) {
          setHasNextPage(Boolean(res.data.pagination.hasNextPage));
        }
      }
    } catch (err) {
      console.error('Error fetching lazy page batch:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage, loadingInitial, page, selectedCategory, selectedCollection, selectedColor, selectedPurity, selectedPriceRange]);

  // Setup IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore && !loadingInitial) {
          fetchNextPage();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, hasNextPage, loadingMore, loadingInitial, fetchNextPage]);

  const updateFilter = (type, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const getHeaderTitle = () => {
    if (selectedCategory) return `DIAMOND ${selectedCategory.toUpperCase()}`;
    if (selectedCollection) return `${selectedCollection.toUpperCase()} COLLECTION`;
    return 'DIAMORA JEWELLERY COLLECTION';
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-20 font-poppins">
      
      {/* PAGE HEADER */}
      <div className="w-[95vw] max-w-[1700px] mx-auto px-4 sm:px-6 text-center pb-8">
        <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.16em] uppercase drop-shadow-[0_2px_15px_rgba(247,224,154,0.35)]">
          <span className="bg-gradient-to-r from-white via-[#F7E09A] to-[#E0B094] bg-clip-text text-transparent">
            {getHeaderTitle()}
          </span>
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#E0B094]/60" />
          <Sparkles className="w-3.5 h-3.5 text-[#E0B094]" />
          <span className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#E0B094]/60" />
        </div>
        <p className="text-xs text-[#C5C8D0] tracking-[0.15em] uppercase mt-3 font-light">
          {loadingInitial ? 'Curating catalog...' : `${totalItems} Exclusive Masterpieces Available`}
        </p>
      </div>

      {/* MOBILE FILTER TOGGLE */}
      <div className="lg:hidden w-[95vw] max-w-[1700px] mx-auto px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E0B094] uppercase"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#E0B094]" />
          <span>Filter Catalog</span>
        </button>

        {(selectedCategory || selectedCollection || selectedColor || selectedPurity || selectedPriceRange) && (
          <button
            onClick={clearAllFilters}
            className="text-[11px] text-[#E0B094] underline tracking-wider font-medium uppercase"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="w-[95vw] max-w-[1700px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT FILTER SIDEBAR (STRICTLY STICKY WITHOUT INTERNAL SCROLLBAR) */}
        <aside className={`lg:col-span-3 sticky top-28 self-start z-30 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#16181F]/90 border border-white/15 rounded-lg p-4 sm:p-5 space-y-4 text-[#F5F5F0] backdrop-blur-3xl shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#E0B094] uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                FILTER BY
              </span>
              {(selectedCategory || selectedCollection || selectedColor || selectedPurity || selectedPriceRange) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] text-[#E0B094] hover:text-white underline uppercase tracking-wider font-medium cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* DYNAMIC JEWELLERY CATEGORY FILTER */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('category')}
                className="flex items-center justify-between w-full py-1 text-left group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#F5F5F0] group-hover:text-[#E0B094] transition-colors uppercase">
                  JEWELLERY TYPE {selectedCategory ? `(${selectedCategory})` : ''}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#E0B094] transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`} />
              </button>
              
              {openSections.category && (
                <div className="space-y-1.5 text-xs font-light text-[#C5C8D0] pt-2 animate-fadeIn">
                  {masterLoading ? (
                    <div className="space-y-2 animate-pulse py-1">
                      <div className="h-3.5 bg-white/10 rounded w-28" />
                      <div className="h-3.5 bg-white/10 rounded w-36" />
                      <div className="h-3.5 bg-white/10 rounded w-24" />
                    </div>
                  ) : categories.length === 0 ? (
                    <span className="text-xs text-[#C5C8D0]/60 italic block py-1 font-normal">No categories created</span>
                  ) : (
                    categories.map(cat => (
                      <button
                        key={cat.id || cat.title}
                        onClick={() => updateFilter('category', selectedCategory === cat.title ? '' : cat.title)}
                        className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                          selectedCategory.toLowerCase() === cat.title.toLowerCase()
                            ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat.title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* DYNAMIC COLLECTIONS FILTER */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleSection('collection')}
                className="flex items-center justify-between w-full py-1 text-left group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#F5F5F0] group-hover:text-[#E0B094] transition-colors uppercase">
                  COLLECTIONS {selectedCollection ? `(${selectedCollection})` : ''}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#E0B094] transition-transform duration-300 ${openSections.collection ? 'rotate-180' : ''}`} />
              </button>

              {openSections.collection && (
                <div className="space-y-1.5 text-xs font-light text-[#C5C8D0] pt-2 animate-fadeIn">
                  {masterLoading ? (
                    <div className="space-y-2 animate-pulse py-1">
                      <div className="h-3.5 bg-white/10 rounded w-32" />
                      <div className="h-3.5 bg-white/10 rounded w-24" />
                    </div>
                  ) : collections.length === 0 ? (
                    <span className="text-xs text-[#C5C8D0]/60 italic block py-1 font-normal">No collections created</span>
                  ) : (
                    collections.map(col => (
                      <button
                        key={col.id || col.title}
                        onClick={() => updateFilter('collection', selectedCollection === col.title ? '' : col.title)}
                        className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                          selectedCollection.toLowerCase() === col.title.toLowerCase()
                            ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {col.title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* COLOR FILTER */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleSection('color')}
                className="flex items-center justify-between w-full py-1 text-left group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#F5F5F0] group-hover:text-[#E0B094] transition-colors uppercase">
                  COLOR {selectedColor ? `(${selectedColor})` : ''}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#E0B094] transition-transform duration-300 ${openSections.color ? 'rotate-180' : ''}`} />
              </button>

              {openSections.color && (
                <div className="space-y-1.5 text-xs font-light text-[#C5C8D0] pt-2 animate-fadeIn">
                  {colors.length > 0 ? (
                    colors.map(clr => (
                      <button
                        key={clr.id || clr.title}
                        onClick={() => updateFilter('color', selectedColor === clr.title ? '' : clr.title)}
                        className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                          selectedColor.toLowerCase() === clr.title.toLowerCase()
                            ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {clr.title}
                      </button>
                    ))
                  ) : (
                    ['Rose Gold', 'White Gold', 'Yellow Gold'].map(clr => (
                      <button
                        key={clr}
                        onClick={() => updateFilter('color', selectedColor === clr ? '' : clr)}
                        className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                          selectedColor.toLowerCase() === clr.toLowerCase()
                            ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {clr}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* PURITY FILTER */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleSection('purity')}
                className="flex items-center justify-between w-full py-1 text-left group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#F5F5F0] group-hover:text-[#E0B094] transition-colors uppercase">
                  PURITY {selectedPurity ? `(${selectedPurity})` : ''}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#E0B094] transition-transform duration-300 ${openSections.purity ? 'rotate-180' : ''}`} />
              </button>

              {openSections.purity && (
                <div className="space-y-1.5 text-xs font-light text-[#C5C8D0] pt-2 animate-fadeIn">
                  {purities.length > 0 ? (
                    purities.map(pur => (
                      <button
                        key={pur.id || pur.title}
                        onClick={() => updateFilter('purity', selectedPurity === pur.title ? '' : pur.title)}
                        className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                          selectedPurity.toLowerCase() === pur.title.toLowerCase()
                            ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {pur.title}
                      </button>
                    ))
                  ) : (
                    ['14kt', '18kt', '22kt', '24kt'].map(pur => (
                      <button
                        key={pur}
                        onClick={() => updateFilter('purity', selectedPurity === pur ? '' : pur)}
                        className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                          selectedPurity.toLowerCase() === pur.toLowerCase()
                            ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {pur}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* EXACT PRICE RANGE FILTER */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full py-1 text-left group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#F5F5F0] group-hover:text-[#E0B094] transition-colors uppercase">
                  PRICE RANGE
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#E0B094] transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
              </button>

              {openSections.price && (
                <div className="space-y-1.5 text-xs font-light text-[#C5C8D0] pt-2 animate-fadeIn">
                  {[
                    { label: 'Under ₹50,000', value: 'under-50k' },
                    { label: '₹50,000 - ₹75,000', value: '50k-75k' },
                    { label: '₹75,000 - ₹100,000', value: '75k-100k' },
                    { label: 'Above ₹100,000', value: 'above-100k' }
                  ].map(pItem => (
                    <button
                      key={pItem.value}
                      onClick={() => updateFilter('price', selectedPriceRange === pItem.value ? '' : pItem.value)}
                      className={`block w-full text-left py-1 tracking-wide transition-colors rounded px-2 ${
                        selectedPriceRange === pItem.value
                          ? 'text-[#E0B094] bg-[#E0B094]/15 font-semibold border-l-2 border-[#E0B094]'
                          : 'hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {pItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* PRODUCT CATALOG GRID */}
        <main className="lg:col-span-9 space-y-8">
          {loadingInitial ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse space-y-3 bg-[#16181F]/70 backdrop-blur-2xl p-4 rounded-lg border border-white/15">
                  <div className="aspect-square bg-white/5 rounded-md" />
                  <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mt-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2 mx-auto mt-1" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#16181F]/75 backdrop-blur-3xl rounded-lg border border-white/15">
              <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-[#F5F5F0] tracking-wider uppercase">
                No Masterpieces Match Selected Filters
              </h3>
              <p className="text-xs text-[#C5C8D0] mt-1 font-light">
                Try resetting your search filters to explore all available creations.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-5 px-5 py-2.5 bg-[#E0B094] text-[#0C0D10] text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#d5a082] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {products.map((product, index) => {
                  const primaryImage = product.media && product.media.length > 0 
                    ? product.media[0].url 
                    : 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';
                  const secondaryImage = product.media && product.media.length > 1 
                    ? product.media[1].url 
                    : null;
                  const formattedPrice = Number(product.grandTotal || product.computedGoldPrice || 0).toLocaleString('en-IN');

                  return (
                    <div 
                      key={`${product.id}-${index}`} 
                      className="group bg-[#16181F]/80 backdrop-blur-2xl border border-white/15 hover:border-[#E0B094]/60 rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-500 ease-out hover:shadow-[0_0_30px_rgba(224,176,148,0.2)] animate-fadeInUp"
                    >
                      {/* PRODUCT IMAGE CONTAINER WITH DUAL-IMAGE CROSS-FADE */}
                      <div className="aspect-square bg-slate-950/60 backdrop-blur-md overflow-hidden relative flex items-center justify-center p-4">
                        {/* Primary Image */}
                        <img 
                          src={primaryImage} 
                          alt={product.title} 
                          className={`w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out ${
                            secondaryImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                          }`}
                          loading="lazy"
                        />

                        {/* Secondary Cover Hover Image */}
                        {secondaryImage && (
                          <img 
                            src={secondaryImage} 
                            alt={`${product.title} Cover`} 
                            className="absolute inset-0 w-full h-full object-contain p-4 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                            loading="lazy"
                          />
                        )}
                        
                        {/* QUICK ACTION OVERLAY */}
                        <div className="absolute inset-0 bg-[#0C0D10]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 z-10">
                          <button
                            onClick={onOpenShop}
                            className="px-4 py-2 bg-[#E0B094] text-[#0C0D10] text-[10px] font-extrabold tracking-widest uppercase rounded-md shadow-xl hover:bg-[#d5a082] transition-colors flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Inquire / Shop</span>
                          </button>
                        </div>
                      </div>

                      {/* PRODUCT CARD DETAILS */}
                      <div className="p-4 text-center space-y-1.5 flex-1 flex flex-col justify-end">
                        <h3 className="font-poppins text-xs font-medium tracking-wide text-[#F5F5F0] uppercase line-clamp-2 leading-relaxed">
                          {product.title}
                        </h3>
                        <p className="font-mono text-xs font-semibold text-[#E0B094]">
                          RS. {formattedPrice}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* LAZY LOAD SKELETON PLACEHOLDERS */}
              {loadingMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                  {[1, 2, 3].map(i => (
                    <div key={`lazy-skel-${i}`} className="animate-pulse space-y-3 bg-[#16181F]/70 backdrop-blur-2xl p-4 rounded-lg border border-white/15">
                      <div className="aspect-square bg-white/5 rounded-md" />
                      <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mt-2" />
                      <div className="h-3 bg-white/10 rounded w-1/2 mx-auto mt-1" />
                    </div>
                  ))}
                </div>
              )}

              {/* INFINITE SCROLL SENTINEL */}
              <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center pt-4">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-xs text-[#E0B094] font-medium tracking-wider uppercase">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E0B094]" />
                    <span>Loading more creations...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

      </div>
    </div>
  );
}
