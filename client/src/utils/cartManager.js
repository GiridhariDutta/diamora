/**
 * Diamora Luxury Cart Manager (LocalStorage Utility)
 * Manages minimal shopping cart items, counts, quantities, and localStorage persistence.
 * Stores ONLY minimal identifiers (productId, quantity, options) so prices and image URLs
 * are dynamically fetched from backend API on Cart Page to reflect live pricing & details.
 */

import Swal from 'sweetalert2';

const CART_KEY = 'diamora_cart';

/**
 * Top-Right Corner Toast Alert for Cart Confirmation
 */
export const showCartAlert = (product) => {
  if (!product) return;

  const title = product.title || 'Haute Joaillerie Masterpiece';

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    background: '#12131A',
    color: '#F5F5F0',
    customClass: {
      popup: 'border border-[#E0B094]/50 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] p-3.5',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: 'success',
    iconColor: '#E0B094',
    title: `<span style="font-family:'Cinzel',serif;font-size:12px;font-weight:bold;color:#fff;">Added to Shopping Cart</span>`,
    html: `<span style="display:block;font-size:11px;color:#E0B094;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${title}</span>`
  });
};

export const getCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to parse cart from localStorage:', err);
    return [];
  }
};

export const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch custom event for real-time listener updates across the application
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

/**
 * Add product to cart storing MINIMAL data (productId, quantity, options)
 * Prices & details are dynamically fetched on Cart Page to reflect live backend prices.
 */
export const addToCart = (product, quantity = 1, options = {}) => {
  if (!product) return getCart();

  const currentCart = getCart();
  const productId = String(product.id || product._id || product.sku);

  if (!productId) {
    console.error('Cannot add product to cart: Invalid Product ID');
    return currentCart;
  }

  // Unique item ID considering selected options (e.g. Color, Purity)
  const cartItemId = options.colorTitle || options.purityTitle
    ? `${productId}-${options.colorTitle || ''}-${options.purityTitle || ''}`
    : productId;

  const existingIndex = currentCart.findIndex(item => item.cartItemId === cartItemId || item.productId === productId);

  if (existingIndex > -1) {
    currentCart[existingIndex].quantity += quantity;
  } else {
    currentCart.push({
      cartItemId,
      productId,
      quantity: Math.max(1, quantity),
      options: {
        colorTitle: options.colorTitle || product.colorTitle || null,
        purityTitle: options.purityTitle || product.purityTitle || null,
        ringSize: options.ringSize || null,
        ...options
      },
      addedAt: new Date().toISOString()
    });
  }

  saveCart(currentCart);
  return currentCart;
};

export const removeFromCart = (cartItemId) => {
  const currentCart = getCart();
  const updated = currentCart.filter(item => item.cartItemId !== cartItemId && item.productId !== cartItemId);
  saveCart(updated);
  return updated;
};

export const updateQuantity = (cartItemId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }
  const currentCart = getCart();
  const index = currentCart.findIndex(item => item.cartItemId === cartItemId || item.productId === cartItemId);
  if (index > -1) {
    currentCart[index].quantity = quantity;
    saveCart(currentCart);
  }
  return currentCart;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
};

/**
 * Robust Product Image Resolver
 * Handles media arrays, images arrays, direct string URLs, primaryImage, thumbnail, etc.
 */
export const getProductImage = (product) => {
  if (!product) return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';

  // 1. Check media array (e.g., from product detail page schema: [{ url: "..." }])
  if (Array.isArray(product.media) && product.media.length > 0) {
    const firstMedia = product.media[0];
    if (typeof firstMedia === 'string' && firstMedia.trim()) return firstMedia.trim();
    if (firstMedia && typeof firstMedia === 'object' && firstMedia.url) return firstMedia.url.trim();
  }

  // 2. Check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    if (typeof firstImg === 'string' && firstImg.trim()) return firstImg.trim();
    if (firstImg && typeof firstImg === 'object' && firstImg.url) return firstImg.url.trim();
  }

  // 3. Check direct string image properties
  if (typeof product.imageUrl === 'string' && product.imageUrl.trim()) return product.imageUrl.trim();
  if (typeof product.primaryImage === 'string' && product.primaryImage.trim()) return product.primaryImage.trim();
  if (typeof product.image === 'string' && product.image.trim()) return product.image.trim();
  if (typeof product.thumbnail === 'string' && product.thumbnail.trim()) return product.thumbnail.trim();

  return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
};

