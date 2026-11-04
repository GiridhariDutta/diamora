import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Maximize2, 
  Video 
} from 'lucide-react';
import ImageSkeleton from './ImageSkeleton';

function GalleryThumbnailItem({ item, idx, isActive, onClick, refProp = null, isModal = false, onLoaded = null }) {
  const [loaded, setLoaded] = useState(false);

  const handleLoaded = () => {
    setLoaded(true);
    if (onLoaded && item?.url) {
      onLoaded(item.url);
    }
  };

  return (
    <button
      key={`thumb-${idx}`}
      ref={refProp}
      onClick={onClick}
      aria-label={`Select media ${idx + 1}`}
      className={`relative ${
        isModal ? 'w-14 h-14 sm:w-16 sm:h-16 rounded-lg' : 'w-16 h-16 sm:w-20 sm:h-20 rounded-md'
      } shrink-0 bg-[#16181F] overflow-hidden border transition-all cursor-pointer ${
        isActive
          ? 'border-[#E0B094] ring-2 ring-[#E0B094]/40 scale-102 shadow-lg'
          : 'border-white/15 hover:border-white/40 opacity-60 hover:opacity-100'
      }`}
    >
      {item.type === 'video' ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-[#E0B094]">
          <Video className="w-4 h-4 mb-0.5" />
          <span className="text-[8px] uppercase font-normal text-slate-300">Video</span>
        </div>
      ) : (
        <>
          {!loaded && <ImageSkeleton />}
          <img
            ref={(el) => {
              if (el && el.complete && el.naturalWidth > 0) handleLoaded();
            }}
            src={item.url}
            alt={`Thumbnail ${idx + 1}`}
            onLoad={handleLoaded}
            onError={handleLoaded}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}
    </button>
  );
}

/**
 * ProductImageGalleryZoom
 * Provides:
 * 1. Desktop Hover Zoom (Flipkart / Amazon style Magnifier Lens + Adjacent High-Res Zoom Window)
 * 2. Mobile Fullscreen Modal (Pinch-to-zoom, Pan, Smooth Finger Swipe with ease-in-out animation, Top-Right Close, and Bottom Thumbnail Carousel with 10px spacing)
 */
export default function ProductImageGalleryZoom({
  mediaList = [],
  activeMediaIndex = 0,
  setActiveMediaIndex,
  productTitle = 'Product Image'
}) {
  const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    type: 'image'
  };

  // --- DESKTOP HOVER ZOOM STATE ---
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, lensW: 160, lensH: 160 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const previewBoxRef = useRef(null);

  // Desktop zoom factor (2.5x high-definition magnification)
  const desktopZoomScale = 2.5;

  // --- SKELETON LOADING & CACHED IMAGE STATE ---
  const [loadedImages, setLoadedImages] = useState({});
  const markImageLoaded = useCallback((url) => {
    if (!url) return;
    setLoadedImages(prev => (prev[url] ? prev : { ...prev, [url]: true }));
  }, []);

  // Main stage moving/slide animation direction on mobile/desktop
  const [mainSwipeDirection, setMainSwipeDirection] = useState(1);
  const isMainSwiping = useRef(false);

  // --- MODAL & TRANSITION STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState(1);
  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(1); // 1 = next (slide left), -1 = prev (slide right)

  // Touch gesture refs for modal
  const touchStartDist = useRef(null);
  const startScale = useRef(1);
  const lastTouchPos = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const modalContainerRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const activeThumbRef = useRef(null);
  const thumbnailListRef = useRef(null);

  // Swipe gesture for main stage (outside modal)
  const mainTouchStartX = useRef(null);
  const mainTouchStartY = useRef(null);
  const mainTouchStartTime = useRef(0);

  // --- DESKTOP HOVER HANDLERS ---
  const handleMouseEnter = () => {
    if (previewBoxRef.current) {
      const rect = previewBoxRef.current.getBoundingClientRect();
      setContainerDimensions({ width: rect.width, height: rect.height });
      const lensW = Math.round(rect.width / desktopZoomScale);
      const lensH = Math.round(rect.height / desktopZoomScale);
      setLensPos(prev => ({ ...prev, lensW, lensH }));
      setIsHovering(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const lensW = Math.round(rect.width / desktopZoomScale);
    const lensH = Math.round(rect.height / desktopZoomScale);

    let x = mouseX - lensW / 2;
    let y = mouseY - lensH / 2;

    // Clamp inside container
    x = Math.max(0, Math.min(rect.width - lensW, x));
    y = Math.max(0, Math.min(rect.height - lensH, y));

    setLensPos({ x, y, lensW, lensH });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // --- SWIPE ON MAIN STAGE (WHEN MODAL IS CLOSED) ---
  const handleMainTouchStart = (e) => {
    if (e.touches.length === 1) {
      mainTouchStartX.current = e.touches[0].clientX;
      mainTouchStartY.current = e.touches[0].clientY;
      mainTouchStartTime.current = Date.now();
      isMainSwiping.current = false;
    }
  };

  const handleMainTouchMove = (e) => {
    if (mainTouchStartX.current !== null && e.touches.length === 1) {
      const diffX = Math.abs(e.touches[0].clientX - mainTouchStartX.current);
      const diffY = Math.abs(e.touches[0].clientY - mainTouchStartY.current);
      if (diffX > 8 && diffX > diffY) {
        isMainSwiping.current = true;
      }
    }
  };

  const handleMainTouchEnd = (e) => {
    if (mainTouchStartX.current === null || mainTouchStartY.current === null) return;
    const currentX = e.changedTouches[0]?.clientX || mainTouchStartX.current;
    const currentY = e.changedTouches[0]?.clientY || mainTouchStartY.current;
    const deltaX = currentX - mainTouchStartX.current;
    const deltaY = currentY - mainTouchStartY.current;
    const deltaTime = Date.now() - mainTouchStartTime.current;

    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    const isSwipeDist = Math.abs(deltaX) > 35 || (Math.abs(deltaX) > 20 && deltaTime < 320);

    if (isHorizontal && isSwipeDist && mediaList.length > 1) {
      isMainSwiping.current = true;
      if (deltaX < 0) {
        // Swiped Left -> Slide to Next Image
        setMainSwipeDirection(1);
        setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
      } else {
        // Swiped Right -> Slide to Previous Image
        setMainSwipeDirection(-1);
        setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    }

    mainTouchStartX.current = null;
    mainTouchStartY.current = null;
  };

  const handleMainBoxClick = () => {
    if (isMainSwiping.current) {
      setTimeout(() => {
        isMainSwiping.current = false;
      }, 120);
      return;
    }
    openModal();
  };

  // --- OPEN / CLOSE FULLSCREEN MODAL ---
  const openModal = () => {
    setIsHovering(false);
    setIsModalOpen(true);
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
    document.body.classList.add('image-modal-open');
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
    document.body.style.overflow = '';
    document.body.classList.remove('image-modal-open');
  }, []);

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') {
        setSwipeDirection(1);
        setActiveMediaIndex(prev => (prev + 1) % mediaList.length);
        setModalScale(1);
        setModalPan({ x: 0, y: 0 });
      }
      if (e.key === 'ArrowLeft') {
        setSwipeDirection(-1);
        setActiveMediaIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
        setModalScale(1);
        setModalPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, mediaList.length, setActiveMediaIndex, closeModal]);

  // Clean up body overflow & class on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('image-modal-open');
    };
  }, []);

  // Auto-scroll active thumbnail into view smoothly
  useEffect(() => {
    if (isModalOpen && activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeMediaIndex, isModalOpen]);

  // --- MODAL ZOOM BUTTON CONTROLS ---
  const handleZoomIn = () => {
    setModalScale(prev => Math.min(4, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setModalScale(prev => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setModalPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
  };

  // Helper to switch image with directional transition
  const switchImage = (targetIndex) => {
    if (targetIndex === activeMediaIndex) return;
    setSwipeDirection(targetIndex > activeMediaIndex ? 1 : -1);
    setActiveMediaIndex(targetIndex);
    handleResetZoom();
  };

  // --- TOUCH HANDLERS FOR FULLSCREEN MODAL (PINCH-TO-ZOOM, PAN, AND FINGER SWIPE) ---
  const handleModalTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      startScale.current = modalScale;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Single touch: double tap, drag or swipe
      const now = Date.now();
      if (now - lastTapTime.current < 280) {
        // Double tap toggle
        if (modalScale > 1) {
          setModalScale(1);
          setModalPan({ x: 0, y: 0 });
        } else {
          setModalScale(2.5);
          setModalPan({ x: 0, y: 0 });
        }
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsDragging(true);
    }
  };

  const handleModalTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartDist.current) {
      // Pinch to zoom
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleMultiplier = currentDist / touchStartDist.current;
      const nextScale = Math.min(4, Math.max(1, startScale.current * scaleMultiplier));
      setModalScale(nextScale);

      if (nextScale <= 1) {
        setModalPan({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && modalScale > 1) {
      // Dragging / panning while zoomed in
      const dx = e.touches[0].clientX - lastTouchPos.current.x;
      const dy = e.touches[0].clientY - lastTouchPos.current.y;

      const container = modalContainerRef.current;
      const cWidth = container ? container.clientWidth : window.innerWidth;
      const cHeight = container ? container.clientHeight : window.innerHeight;

      const maxPanX = (cWidth * (modalScale - 1)) / 2;
      const maxPanY = (cHeight * (modalScale - 1)) / 2;

      setModalPan(prev => ({
        x: Math.max(-maxPanX, Math.min(maxPanX, prev.x + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, prev.y + dy))
      }));

      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleModalTouchEnd = (e) => {
    if (e.touches.length < 2) {
      touchStartDist.current = null;
    }

    if (e.touches.length === 0) {
      // Check for finger swipe to change image (only when modalScale === 1)
      if (modalScale === 1 && touchStartPos.current && mediaList.length > 1) {
        const endX = e.changedTouches[0]?.clientX || lastTouchPos.current.x;
        const endY = e.changedTouches[0]?.clientY || lastTouchPos.current.y;
        const deltaX = endX - touchStartPos.current.x;
        const deltaY = endY - touchStartPos.current.y;

        // Swipe threshold: 45px horizontal
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
          if (deltaX < 0) {
            // Swiped Left -> Next Image with smooth ease-in-out transition
            setSwipeDirection(1);
            setActiveMediaIndex(prev => (prev + 1) % mediaList.length);
            handleResetZoom();
          } else {
            // Swiped Right -> Previous Image with smooth ease-in-out transition
            setSwipeDirection(-1);
            setActiveMediaIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
            handleResetZoom();
          }
        }
      }

      setIsDragging(false);

      if (modalScale <= 1.05) {
        setModalScale(1);
        setModalPan({ x: 0, y: 0 });
      }
    }
  };

  // --- MOUSE WHEEL ZOOM (DESKTOP INSIDE MODAL) ---
  const handleModalWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.3 : -0.3;
    setModalScale(prev => {
      const next = Math.min(4, Math.max(1, Number((prev + zoomDelta).toFixed(1))));
      if (next === 1) setModalPan({ x: 0, y: 0 });
      return next;
    });
  };

  // --- MOUSE DRAG IN MODAL ---
  const handleModalMouseDown = (e) => {
    if (modalScale > 1) {
      setIsDragging(true);
      lastTouchPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleModalMouseMove = (e) => {
    if (isDragging && modalScale > 1) {
      const dx = e.clientX - lastTouchPos.current.x;
      const dy = e.clientY - lastTouchPos.current.y;

      const container = modalContainerRef.current;
      const cWidth = container ? container.clientWidth : window.innerWidth;
      const cHeight = container ? container.clientHeight : window.innerHeight;

      const maxPanX = (cWidth * (modalScale - 1)) / 2;
      const maxPanY = (cHeight * (modalScale - 1)) / 2;

      setModalPan(prev => ({
        x: Math.max(-maxPanX, Math.min(maxPanX, prev.x + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, prev.y + dy))
      }));

      lastTouchPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleModalMouseUp = () => {
    setIsDragging(false);
  };

  // --- MOTION VARIANTS FOR SILKY EASE-IN-OUT SLIDE ---
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.32,
        ease: [0.25, 0.1, 0.25, 1.0] // Smooth ease-in-out curve
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.24,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    })
  };

  // --- MAIN PREVIEW MOVING / SLIDE ANIMATION VARIANTS (ON MOBILE & DESKTOP) ---
  const mainSlideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] },
        scale: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.22,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    })
  };

  return (
    <div className="w-full flex flex-col-reverse sm:flex-row gap-3 items-start relative">
      
      {/* 1. VERTICAL / HORIZONTAL THUMBNAIL LIST (ON PRODUCT PAGE) */}
      {mediaList.length > 1 && (
        <div className="flex sm:flex-col items-center gap-2 overflow-x-auto sm:overflow-y-auto max-h-[480px] w-full sm:w-20 shrink-0 scrollbar-none py-1 sm:py-0">
          {mediaList.map((item, idx) => (
            <GalleryThumbnailItem
              key={`thumb-${idx}`}
              item={item}
              idx={idx}
              isActive={activeMediaIndex === idx}
              onLoaded={markImageLoaded}
              onClick={() => {
                setMainSwipeDirection(idx > activeMediaIndex ? 1 : -1);
                setActiveMediaIndex(idx);
                setIsHovering(false);
              }}
            />
          ))}
        </div>
      )}

      {/* 2. MAIN PREVIEW BOX & DESKTOP HOVER ZOOM WRAPPER */}
      <div className="relative flex-1 w-full">
        
        {/* Main Stage Preview Box */}
        <div 
          ref={previewBoxRef}
          className="w-full bg-[#16181F] border border-white/15 rounded-xl overflow-hidden relative shadow-xl aspect-square sm:aspect-[4/3] flex items-center justify-center select-none cursor-pointer lg:cursor-crosshair group touch-pan-y"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMainTouchStart}
          onTouchMove={handleMainTouchMove}
          onTouchEnd={handleMainTouchEnd}
          onClick={handleMainBoxClick}
        >
          <AnimatePresence mode="popLayout" custom={mainSwipeDirection} initial={false}>
            <motion.div
              key={currentMedia.url}
              custom={mainSwipeDirection}
              variants={mainSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex items-center justify-center relative"
            >
              {currentMedia.type === 'video' ? (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  {/* SKELETON LOADER FOR MAIN IMAGE */}
                  {!loadedImages[currentMedia.url] && (
                    <ImageSkeleton rounded="rounded-xl" />
                  )}
                  <img
                    ref={(el) => {
                      if (el && el.complete && el.naturalWidth > 0) {
                        markImageLoaded(currentMedia.url);
                      }
                    }}
                    src={currentMedia.url}
                    alt={productTitle}
                    onLoad={() => markImageLoaded(currentMedia.url)}
                    onError={() => markImageLoaded(currentMedia.url)}
                    className={`w-full h-full object-contain p-2.5 transition-opacity duration-300 ${
                      loadedImages[currentMedia.url] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* DESKTOP HOVER LENS (Flipkart / Amazon Style) */}
          {isHovering && currentMedia.type !== 'video' && (
            <div 
              className="hidden lg:block absolute pointer-events-none border border-[#E0B094]/90 bg-[#E0B094]/20 rounded shadow-md backdrop-contrast-125 z-20"
              style={{
                width: `${lensPos.lensW}px`,
                height: `${lensPos.lensH}px`,
                left: `${lensPos.x}px`,
                top: `${lensPos.y}px`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-2 h-2 border border-[#E0B094] rounded-full" />
              </div>
            </div>
          )}

          {/* Action Hints: Desktop Hover Hint & Mobile Tap Hint */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/15 text-[#E0B094] text-[10px] font-light px-2.5 py-1 rounded-full pointer-events-none shadow-md group-hover:border-[#E0B094]/50 transition-colors z-10">
            <Maximize2 className="w-3 h-3 text-[#E0B094]" />
            <span className="hidden lg:inline">Hover to zoom • Click to expand</span>
            <span className="lg:hidden">Tap to zoom</span>
          </div>

          {/* Image Counter Badge */}
          {mediaList.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/15 text-[#E0B094] text-[10px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none shadow-md z-10">
              {activeMediaIndex + 1} / {mediaList.length}
            </div>
          )}
        </div>

        {/* 3. DESKTOP HOVER ZOOM PREVIEW WINDOW (Flipkart / Amazon Flyout Style) */}
        {isHovering && currentMedia.type !== 'video' && containerDimensions.width > 0 && (
          <div 
            className="hidden lg:block absolute left-[calc(100%+16px)] top-0 w-full h-full min-h-[460px] bg-[#16181F] border border-[#E0B094]/60 rounded-xl shadow-[0_25px_65px_rgba(0,0,0,0.95)] overflow-hidden z-50 pointer-events-none"
          >
            <div className="w-full h-full relative overflow-hidden bg-[#16181F] flex items-center justify-center">
              <img
                src={currentMedia.url}
                alt="Zoomed Detail"
                className="absolute max-w-none pointer-events-none select-none transition-none"
                style={{
                  width: `${containerDimensions.width * desktopZoomScale}px`,
                  height: `${containerDimensions.height * desktopZoomScale}px`,
                  left: `${-lensPos.x * desktopZoomScale}px`,
                  top: `${-lensPos.y * desktopZoomScale}px`,
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}

      </div>

      {/* 4. FULLSCREEN MODAL (MOUNTED DIRECTLY TO BODY VIA PORTAL WITH Z-[99999]) */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-[#0C0D10] flex flex-col justify-between select-none touch-none"
          style={{ overscrollBehavior: 'contain' }}
        >
          
          {/* TOP BAR: BALANCED 3-COLUMN FLEX LAYOUT (LEFT: TITLE/COUNT, CENTER: ZOOM CONTROLS, RIGHT: CLOSE BUTTON) */}
          <div className="w-full h-14 sm:h-16 px-4 sm:px-6 bg-black/75 border-b border-white/10 flex items-center justify-between gap-3 z-20 shrink-0">
            
            {/* Left: Product Title & Counter */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-[35%]">
              <span className="text-white text-xs sm:text-sm font-medium truncate">
                {productTitle}
              </span>
              {mediaList.length > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#E0B094] text-[11px] font-mono shrink-0">
                  {activeMediaIndex + 1} / {mediaList.length}
                </span>
              )}
            </div>

            {/* Center: Zoom Controls (+ / - / Reset) */}
            {currentMedia.type !== 'video' ? (
              <div className="flex items-center gap-1 sm:gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1 shrink-0">
                <button
                  onClick={handleZoomOut}
                  disabled={modalScale <= 1}
                  aria-label="Zoom out"
                  className="p-1 sm:p-1.5 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono text-[#E0B094] px-1 min-w-[34px] text-center">
                  {modalScale.toFixed(1)}x
                </span>

                <button
                  onClick={handleZoomIn}
                  disabled={modalScale >= 4}
                  aria-label="Zoom in"
                  className="p-1 sm:p-1.5 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {modalScale > 1 && (
                  <button
                    onClick={handleResetZoom}
                    aria-label="Reset zoom"
                    className="p-1 sm:p-1.5 text-[#E0B094] hover:text-white transition-colors border-l border-white/10 pl-2 ml-0.5 cursor-pointer"
                    title="Reset to 1x"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="shrink-0" />
            )}

            {/* Right: Close (X) Button (Properly positioned in flex flow to eliminate any overlap) */}
            <div className="flex items-center justify-end flex-1 max-w-[35%]">
              <button
                onClick={closeModal}
                aria-label="Close fullscreen view"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/15 shadow-md"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </div>

          {/* MAIN INTERACTIVE CANVAS WITH EASE-IN-OUT SLIDE ANIMATION */}
          <div 
            ref={modalContainerRef}
            className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-2 sm:p-4"
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            onWheel={handleModalWheel}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
          >
            <AnimatePresence mode="wait" custom={swipeDirection}>
              <motion.div
                key={currentMedia.url}
                custom={swipeDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex items-center justify-center"
              >
                {currentMedia.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative"
                    style={{ touchAction: 'none' }}
                  >
                    {!loadedImages[currentMedia.url] && (
                      <ImageSkeleton />
                    )}
                    <img
                      ref={(el) => {
                        if (el && el.complete && el.naturalWidth > 0) {
                          markImageLoaded(currentMedia.url);
                        }
                      }}
                      src={currentMedia.url}
                      alt={productTitle}
                      draggable={false}
                      onLoad={() => markImageLoaded(currentMedia.url)}
                      onError={() => markImageLoaded(currentMedia.url)}
                      className={`max-w-[92vw] max-h-[72vh] sm:max-h-[75vh] object-contain pointer-events-none select-none transition-transform ${
                        loadedImages[currentMedia.url] ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transform: `translate(${modalPan.x}px, ${modalPan.y}px) scale(${modalScale})`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                        transformOrigin: 'center center'
                      }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 5. BOTTOM IMAGE LIST (CENTERED ON DESKTOP, NO-CLIP SAFE SCROLL ON MOBILE) */}
          <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 pt-2.5 pb-6 sm:pb-4 z-20 shrink-0">
            <div 
              ref={thumbnailListRef}
              className="w-full overflow-x-auto scrollbar-none px-3 py-1 flex justify-start sm:justify-center"
              style={{ justifyContent: 'safe center' }}
            >
              <div className="flex items-center gap-[10px] px-2 shrink-0">
                {mediaList.map((item, idx) => (
                  <GalleryThumbnailItem
                    key={`modal-thumb-${idx}`}
                    refProp={activeMediaIndex === idx ? activeThumbRef : null}
                    item={item}
                    idx={idx}
                    isActive={activeMediaIndex === idx}
                    onLoaded={markImageLoaded}
                    onClick={() => switchImage(idx)}
                    isModal={true}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>,
        document.body
      )}

    </div>
  );
}
