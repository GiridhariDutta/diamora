import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function MyOrdersPage() {
  const { user, onOpenAuthModal } = useOutletContext() || {};
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchUserOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const uIdentifier = user.uid || user.id || user.email;
      const res = await api.get(`/api/orders?userId=${uIdentifier}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Fetch user orders error:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#12131A] border border-[#E0B094]/30 rounded-xl p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="w-14 h-14 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 text-[#E0B094] flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7" />
          </div>
          <h2 className="font-cinzel text-xl font-bold text-white mb-2">Member Profile Access</h2>
          <p className="text-xs text-[#C5C8D0] leading-relaxed mb-5 font-open-sans">
            Please log in or sign up to view your orders and track your artisan jewelry purchases.
          </p>
          <button
            onClick={onOpenAuthModal}
            className="w-full py-3 bg-gradient-to-r from-[#F7E09A] via-[#D4AF37] to-[#C59B27] text-[#0C0D10] font-semibold text-xs tracking-[0.2em] uppercase rounded-lg hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            LOG IN TO YOUR ACCOUNT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-open-sans select-none">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#12131A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-[#E0B094]" />
              <h2 className="font-cinzel text-base font-bold text-white tracking-wide">
                My Orders ({orders.length})
              </h2>
            </div>
            <button
              onClick={fetchUserOrders}
              disabled={ordersLoading}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#E0B094] hover:bg-[#E0B094]/10 text-[#C5C8D0] hover:text-[#E0B094] transition-all cursor-pointer disabled:opacity-50 group"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin text-[#E0B094]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>

          {ordersLoading ? (
            <div className="p-8 text-center text-xs text-[#C5C8D0]">
              Loading your order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-[#0C0D10] border border-dashed border-white/15 rounded-xl space-y-3">
              <ShoppingBag className="w-8 h-8 text-[#E0B094]/60 mx-auto" />
              <h3 className="font-cinzel text-sm font-semibold text-white">No Orders Found</h3>
              <p className="text-xs text-[#C5C8D0] max-w-sm mx-auto leading-relaxed">
                You haven't placed any diamond orders yet. Browse our atelier collection to discover exquisite creations.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-5 py-2 rounded-lg border border-[#E0B094]/40 hover:border-[#E0B094] bg-white/5 text-[#E0B094] text-xs font-semibold tracking-wider uppercase transition-all mt-2 cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const dateStr = ord.createdAt 
                  ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent Order';

                const orderItems = Array.isArray(ord.items) && ord.items.length > 0 
                  ? ord.items 
                  : [{
                      title: ord.productTitle || 'Haute Joaillerie Piece',
                      image: ord.productImage || '',
                      price: ord.productPrice || ord.totalAmount || 0,
                      quantity: 1,
                      metal: ord.selectedMetal,
                      color: ord.selectedColor
                    }];

                return (
                  <div 
                    key={ord.id} 
                    className="bg-[#0C0D10] border border-white/10 hover:border-[#E0B094]/50 rounded-xl p-4 sm:p-5 space-y-4 transition-all"
                  >
                    {/* ORDER TOP METADATA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#E0B094] font-bold">
                            Order #{ord.id?.slice(-8)?.toUpperCase() || ord.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9.5px] font-bold uppercase tracking-wider">
                            {ord.paymentStatus || ord.status || 'Paid'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C5C8D0]/60 mt-0.5">Placed on {dateStr}</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-[#C5C8D0]/50 uppercase tracking-wider block">Total Amount</span>
                        <span className="font-mono text-base font-bold text-emerald-400">
                          ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="space-y-3">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" 
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#E0B094]">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-white text-xs">{item.title}</h4>
                              <div className="text-[11px] text-[#C5C8D0]/70 flex items-center gap-2">
                                <span>Qty: <strong className="text-white">{item.quantity || 1}</strong></span>
                                {item.metal && <span>• Metal: {item.metal}</span>}
                                {item.color && <span>• Color: {item.color}</span>}
                              </div>
                            </div>
                          </div>

                          <span className="font-mono font-medium text-white text-xs">
                            ₹{(Number(item.price || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* PAYMENT & SHIPPING FOOTER */}
                    <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#C5C8D0]/80">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#E0B094] block mb-0.5">Shipping Address</span>
                        <p className="text-white">{ord.customerName} ({ord.customerPhone})</p>
                        <p className="line-clamp-2">{ord.shippingAddress} {ord.landmark ? `(Near ${ord.landmark})` : ''}, {ord.city}, {ord.state} - {ord.pincode}</p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] uppercase font-semibold text-[#E0B094] block mb-0.5">Payment Reference</span>
                        <p>Gateway: <strong className="text-white">{ord.paymentMethod || 'Razorpay Online'}</strong></p>
                        {ord.razorpayPaymentId && (
                          <p className="font-mono text-[10px] text-white/70">Payment ID: {ord.razorpayPaymentId}</p>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
