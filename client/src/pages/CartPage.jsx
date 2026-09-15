import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Award, Lock, Sparkles, Check } from 'lucide-react';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } from '../utils/cartManager';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const reloadCart = () => {
    const items = getCart();
    setCartItems(items);
    setCartTotal(getCartTotal());
  };

  useEffect(() => {
    reloadCart();

    const handleCartUpdate = () => {
      reloadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleRemove = (cartItemId) => {
    const updated = removeFromCart(cartItemId);
    setCartItems(updated);
    setCartTotal(getCartTotal());
  };

  const handleQuantityChange = (cartItemId, newQty) => {
    const updated = updateQuantity(cartItemId, newQty);
    setCartItems(updated);
    setCartTotal(getCartTotal());
  };

  const formattedTotal = Number(cartTotal).toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 sm:pt-28 pb-16 px-4 sm:px-8 lg:px-12 font-open-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-[#C5C8D0] uppercase tracking-wider font-light">
            <Link to="/" className="hover:text-[#E0B094]">HOME</Link>
            <span>/</span>
            <span className="text-[#E0B094] font-normal">SHOPPING CART</span>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-2 text-xs text-[#E0B094] hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* PAGE TITLE */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-poppins text-xs font-medium tracking-[0.28em] text-[#E0B094] uppercase block">
              YOUR SELECTIONS
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-normal text-white mt-1">
              Shopping Cart
            </h1>
          </div>
          <span className="text-xs text-[#C5C8D0] font-mono">
            {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} {cartItems.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {/* EMPTY CART STATE */}
        {cartItems.length === 0 ? (
          <div className="bg-[#12131A] border border-white/10 rounded-3xl p-12 text-center space-y-5 shadow-2xl max-w-2xl mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 text-[#E0B094] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-9 h-9" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-cinzel text-2xl font-bold text-white">Your Cart is Currently Empty</h2>
              <p className="text-xs text-[#C5C8D0] max-w-md mx-auto leading-relaxed">
                Discover our handcrafted Haute Joaillerie masterpieces, signature solitaire diamonds, and fine gold collections.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-3.5 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.22em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_25px_rgba(212,175,55,0.35)] cursor-pointer"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          </div>
        ) : (
          /* CART CONTENT GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CART ITEMS LIST (SPAN 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {cartItems.map((item) => (
                <div 
                  key={item.cartItemId || item.id}
                  className="bg-[#12131A] border border-white/10 hover:border-[#E0B094]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 transition-all shadow-xl"
                >
                  
                  {/* Product Thumbnail */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#161822] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info & Options */}
                  <div className="flex-1 space-y-1.5 text-center sm:text-left w-full">
                    {item.categoryTitle && (
                      <span className="text-[10px] font-mono text-[#E0B094] uppercase tracking-widest block">
                        {item.categoryTitle}
                      </span>
                    )}

                    <h3 className="font-serif text-base sm:text-lg font-normal text-white leading-tight">
                      {item.title}
                    </h3>

                    {/* Selected Metal & Purity Options */}
                    {(item.options?.purityTitle || item.options?.colorTitle) && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-[#C5C8D0]">
                        {item.options.purityTitle && (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            Purity: <strong className="text-white font-normal">{item.options.purityTitle}</strong>
                          </span>
                        )}
                        {item.options.colorTitle && (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            Color: <strong className="text-white font-normal">{item.options.colorTitle}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="font-mono text-sm font-semibold text-[#E0B094] sm:hidden pt-1">
                      ₹{(item.rawPrice ? (item.rawPrice * item.quantity).toLocaleString('en-IN') : item.price)}
                    </div>
                  </div>

                  {/* Quantity Controls & Price (Desktop & Mobile) */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    
                    {/* Quantity Modifier */}
                    <div className="flex items-center rounded-lg border border-white/15 bg-[#0C0D10] overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(item.cartItemId || item.id, item.quantity - 1)}
                        className="p-2 text-[#C5C8D0] hover:text-white hover:bg-white/10 transition-colors"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-3 text-xs font-mono text-white font-semibold min-w-[28px] text-center">
                        {item.quantity || 1}
                      </span>

                      <button
                        onClick={() => handleQuantityChange(item.cartItemId || item.id, item.quantity + 1)}
                        className="p-2 text-[#C5C8D0] hover:text-white hover:bg-white/10 transition-colors"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal for Item */}
                    <div className="hidden sm:block text-right min-w-[100px]">
                      <span className="text-[10px] text-[#C5C8D0]/60 block uppercase">Subtotal</span>
                      <span className="font-mono text-base font-semibold text-[#E0B094]">
                        ₹{(item.rawPrice ? (item.rawPrice * item.quantity).toLocaleString('en-IN') : item.price)}
                      </span>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => handleRemove(item.cartItemId || item.id)}
                      className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              ))}

              {/* Clear Cart Link */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => clearCart()}
                  className="text-xs text-red-400/80 hover:text-red-400 underline font-light transition-colors cursor-pointer"
                >
                  Clear All Cart Items
                </button>

                <span className="text-xs text-[#C5C8D0]/60 font-mono">
                  Prices inclusive of all taxes & certification
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY CARD (SPAN 4) */}
            <div className="lg:col-span-4 bg-[#12131A] border border-[#E0B094]/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl sticky top-28">
              
              <div className="border-b border-white/10 pb-4">
                <span className="font-poppins text-xs font-semibold tracking-[0.2em] text-[#E0B094] uppercase block">
                  SUMMARY
                </span>
                <h2 className="font-cinzel text-xl font-bold text-white mt-0.5">
                  Order Breakdown
                </h2>
              </div>

              {/* Price Details */}
              <div className="space-y-3.5 text-xs text-[#C5C8D0] font-light">
                <div className="flex justify-between items-center">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-white font-medium">₹{formattedTotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-400 font-medium">COMPLIMENTARY</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Hallmark Certification</span>
                  <span className="text-[#E0B094] font-medium">INCLUDED</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Luxury Vault Packaging</span>
                  <span className="text-[#E0B094] font-medium">INCLUDED</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Estimated Total</span>
                  <span className="font-mono text-2xl font-bold text-[#E0B094]">
                    ₹{formattedTotal}
                  </span>
                </div>
                <p className="text-[10px] text-[#C5C8D0]/50 italic text-right">
                  Includes GST tax and fully insured transit
                </p>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={() => alert('Proceeding to Checkout... (Next feature step)')}
                className="w-full py-4 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-bold text-xs tracking-[0.22em] uppercase rounded-xl hover:brightness-110 transition-all shadow-[0_4px_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Security & Authenticity Trust Badges */}
              <div className="pt-2 border-t border-white/10 space-y-2.5 text-[11px] text-[#C5C8D0]/70 font-light">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#E0B094] shrink-0" />
                  <span>100% Certified Solid Gold & Hallmarked</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#E0B094] shrink-0" />
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#E0B094] shrink-0" />
                  <span>Lifetime Authenticity Guarantee</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
