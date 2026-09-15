/**
 * Diamora Luxury Cart Manager (LocalStorage Utility)
 * Manages shopping cart items, counts, quantities, and localStorage persistence.
 * Dispatches 'cartUpdated' window events for real-time UI synchronization across all components.
 */

const CART_KEY = 'diamora_cart';

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
    // Dispatch custom event to notify all listeners (e.g. Navbar badge, Cart Page)
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

export const addToCart = (product, quantity = 1, options = {}) => {
  if (!product) return getCart();

  const currentCart = getCart();
  const rawPrice = Number(product.grandTotal || product.computedGoldPrice || product.price || 0);
  const formattedPrice = rawPrice ? `₹${rawPrice.toLocaleString('en-IN')}` : (product.price || '₹0');
  
  const mainImage = product.media && product.media.length > 0
    ? (typeof product.media[0] === 'string' ? product.media[0] : product.media[0]?.url)
    : product.image || '/images/ring_hero.jpg';

  // Unique key considering product ID and options (e.g. ring size, color)
  const cartItemId = options.colorTitle || options.purityTitle
    ? `${product.id || product._id}-${options.colorTitle || ''}-${options.purityTitle || ''}`
    : (product.id || product._id || `prod-${Date.now()}`);

  const existingIndex = currentCart.findIndex(item => item.cartItemId === cartItemId || item.id === product.id);

  if (existingIndex > -1) {
    // Increase quantity of existing item
    currentCart[existingIndex].quantity += quantity;
  } else {
    // Add new item to cart
    currentCart.push({
      cartItemId,
      id: product.id || product._id,
      title: product.title || 'Haute Joaillerie Masterpiece',
      categoryTitle: product.categoryTitle || 'Jewelry',
      image: mainImage,
      rawPrice,
      price: formattedPrice,
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
  const updated = currentCart.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId);
  saveCart(updated);
  return updated;
};

export const updateQuantity = (cartItemId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }
  const currentCart = getCart();
  const index = currentCart.findIndex(item => item.cartItemId === cartItemId || item.id === cartItemId);
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

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + ((item.rawPrice || 0) * (item.quantity || 1)), 0);
};
