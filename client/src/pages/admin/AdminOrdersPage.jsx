import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  X, 
  ExternalLink,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

// Executive Light SweetAlert2 configuration
const lightSwal = Swal.mixin({
  background: '#FFFFFF',
  color: '#0F172A',
  confirmButtonColor: '#D4AF37',
  cancelButtonColor: '#94A3B8',
  customClass: {
    popup: 'border border-slate-200 rounded-[4px] font-open-sans shadow-xl',
    confirmButton: 'text-slate-[#0C0D10] font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]',
    cancelButton: 'text-slate-700 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]'
  }
});

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'New', 'Viewed'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Orders API fetch warning:', err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Status Handler (e.g. Mark as Viewed or New)
  const handleToggleStatus = async (order) => {
    const nextStatus = order.status === 'Viewed' ? 'New' : 'Viewed';
    try {
      const res = await api.put(`/api/orders/${order.id}/status`, { status: nextStatus });
      if (res.data?.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
        
        // Update selected order modal if open
        if (selectedOrderDetails?.id === order.id) {
          setSelectedOrderDetails(prev => ({ ...prev, status: nextStatus }));
        }

        lightSwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Inquiry Marked as ${nextStatus}!`,
          showConfirmButton: false,
          timer: 1800
        });
      }
    } catch (err) {
      lightSwal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        text: err.message || 'Could not update inquiry status.'
      });
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = (order) => {
    lightSwal.fire({
      title: 'Delete Inquiry Order?',
      text: `Are you sure you want to delete inquiry from "${order.customerName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/orders/${order.id}`);
          if (res.data?.success) {
            setOrders(prev => prev.filter(o => o.id !== order.id));
            if (selectedOrderDetails?.id === order.id) {
              setSelectedOrderDetails(null);
            }
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Inquiry has been removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete inquiry.'
          });
        }
      }
    });
  };

  // Filtered orders computation
  const filteredOrders = orders.filter(o => {
    // Status Filter
    if (statusFilter === 'New' && o.status !== 'New') return false;
    if (statusFilter === 'Viewed' && o.status !== 'Viewed') return false;

    // Search Filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(term)) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(term)) ||
      (o.productTitle && o.productTitle.toLowerCase().includes(term)) ||
      (o.productSku && o.productSku.toLowerCase().includes(term))
    );
  });

  // Stats calculation
  const totalCount = orders.length;
  const newCount = orders.filter(o => o.status === 'New').length;
  const viewedCount = orders.filter(o => o.status === 'Viewed').length;

  return (
    <div className="space-y-4 font-open-sans">
      
      {/* METRICS HEADER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* TOTAL INQUIRIES */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Total Inquiries
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* NEW / UNREAD INQUIRIES */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-amber-800 uppercase tracking-wider block mb-0.5">
              New / Unread
            </span>
            <span className="text-2xl font-bold text-amber-900 font-mono">{newCount}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-amber-100/70 border border-amber-300 text-amber-900 flex items-center justify-center relative">
            <Clock className="w-5 h-5" />
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-600 animate-ping" />
            )}
          </div>
        </div>

        {/* VIEWED INQUIRIES */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5">
              Viewed / Processed
            </span>
            <span className="text-2xl font-bold text-emerald-900 font-mono">{viewedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-4 shadow-2xs">
        
        {/* HEADER & FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              Customer Orders & Product Inquiries
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              View client inquiries, mark review status, or contact clients directly
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-[4px] border border-slate-200">
              {['All', 'New', 'Viewed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-[10.5px] font-semibold tracking-wider uppercase rounded-[3px] transition-all ${
                    statusFilter === status
                      ? 'bg-white text-slate-950 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status} {status === 'New' && newCount > 0 ? `(${newCount})` : ''}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 w-44 sm:w-56 shadow-2xs"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchOrders}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

          </div>
        </div>

        {/* INQUIRIES TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2.5 px-3 w-28">Status</th>
                <th className="py-2.5 px-3">Customer Details</th>
                <th className="py-2.5 px-3">Inquired Product</th>
                <th className="py-2.5 px-3">Details / Options</th>
                <th className="py-2.5 px-3">Inquiry Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-ord-${n}`} className="animate-pulse bg-white">
                    <td className="py-3 px-3"><div className="h-5 w-16 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-32 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-40 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-28 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-6 w-16 bg-slate-200 rounded-[4px] ml-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-medium">
                    No inquiry orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isNew = order.status === 'New';
                  const formattedDate = order.createdAt 
                    ? new Date(order.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A';

                  return (
                    <tr 
                      key={order.id}
                      className={`transition-colors ${
                        isNew ? 'bg-amber-50/40 hover:bg-amber-50/80 font-medium' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* STATUS BADGE */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-[3px] text-[9px] font-semibold uppercase inline-flex items-center gap-1.5 ${
                          isNew 
                            ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs' 
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-amber-600 animate-pulse' : 'bg-emerald-600'}`} />
                          {order.status || 'New'}
                        </span>
                      </td>

                      {/* CUSTOMER DETAILS */}
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{order.customerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-600">
                            <Phone className="w-3 h-3 text-amber-800" />
                            <a 
                              href={`tel:${order.customerPhone}`} 
                              className="hover:text-amber-800 hover:underline"
                              title="Click to call"
                            >
                              {order.customerPhone}
                            </a>
                          </div>

                          {order.customerEmail && (
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{order.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* INQUIRED PRODUCT */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {order.productImage ? (
                            <img 
                              src={order.productImage} 
                              alt={order.productTitle}
                              className="w-10 h-10 rounded-[4px] object-cover border border-slate-200 shrink-0 shadow-2xs" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-4 h-4 text-amber-800" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                              {order.productTitle || 'General Product'}
                            </p>
                            {order.productSku && (
                              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                                SKU: {order.productSku}
                              </span>
                            )}
                            {order.productPrice ? (
                              <span className="text-[10.5px] font-mono font-semibold text-amber-900">
                                ₹{Number(order.productPrice).toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* OPTIONS / NOTES */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {order.selectedMetal && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px] text-slate-700 font-medium mr-1">
                              Metal: {order.selectedMetal}
                            </span>
                          )}
                          {order.selectedColor && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px] text-slate-700 font-medium">
                              Color: {order.selectedColor}
                            </span>
                          )}
                          {order.notes ? (
                            <p className="text-[10.5px] text-slate-600 italic truncate max-w-[180px]">
                              "{order.notes}"
                            </p>
                          ) : !order.selectedMetal && !order.selectedColor ? (
                            <span className="text-slate-400 text-[10.5px] italic">No special options</span>
                          ) : null}
                        </div>
                      </td>

                      {/* INQUIRY DATE */}
                      <td className="py-3 px-3 font-mono text-[10.5px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Toggle Viewed Button */}
                          <button
                            onClick={() => handleToggleStatus(order)}
                            className={`px-2.5 py-1 rounded-[4px] text-[10px] font-semibold tracking-wider uppercase transition-all border flex items-center gap-1 ${
                              isNew
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 border-amber-500 shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                            }`}
                            title={isNew ? 'Mark Inquiry as Viewed' : 'Mark Inquiry as New'}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isNew ? 'Mark Viewed' : 'Viewed'}</span>
                          </button>

                          {/* Detail Modal Trigger */}
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-amber-800 rounded-[4px] transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs font-open-sans animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pb-2 border-b border-slate-200">
              <span className="text-[10px] font-semibold tracking-widest text-amber-800 uppercase block">
                INQUIRY ORDER DETAILS
              </span>
              <h3 className="text-base font-bold text-slate-950 font-open-sans uppercase">
                {selectedOrderDetails.productTitle || 'Product Inquiry'}
              </h3>
              <p className="text-xs text-slate-500">
                Inquiry Ref ID: <span className="font-mono">{selectedOrderDetails.id}</span>
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-800">
              
              {/* CUSTOMER INFO */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                  Customer Contact Information
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Name</span>
                    <span className="font-bold text-slate-900">{selectedOrderDetails.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Phone</span>
                    <a 
                      href={`tel:${selectedOrderDetails.customerPhone}`}
                      className="font-bold text-amber-900 hover:underline font-mono"
                    >
                      {selectedOrderDetails.customerPhone}
                    </a>
                  </div>
                  {selectedOrderDetails.customerEmail && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Email</span>
                      <span className="font-medium text-slate-700">{selectedOrderDetails.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PRODUCT INFO */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex items-start gap-3">
                {selectedOrderDetails.productImage && (
                  <img 
                    src={selectedOrderDetails.productImage} 
                    alt="Product"
                    className="w-16 h-16 rounded-[4px] object-cover border border-slate-300 shrink-0" 
                  />
                )}
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                    Inquired Product Details
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrderDetails.productTitle}</p>
                  {selectedOrderDetails.productSku && (
                    <p className="font-mono text-[10px] text-slate-500">SKU: {selectedOrderDetails.productSku}</p>
                  )}
                  {selectedOrderDetails.productPrice && (
                    <p className="font-mono font-bold text-amber-900">₹{Number(selectedOrderDetails.productPrice).toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>

              {/* NOTES */}
              {selectedOrderDetails.notes && (
                <div className="p-3 bg-amber-50/60 rounded-[4px] border border-amber-200">
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider mb-1">
                    Customer Notes / Special Request
                  </span>
                  <p className="text-slate-800 italic">"{selectedOrderDetails.notes}"</p>
                </div>
              )}

              {/* MODAL ACTIONS */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  onClick={() => handleToggleStatus(selectedOrderDetails)}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase shadow-2xs"
                >
                  {selectedOrderDetails.status === 'Viewed' ? 'Mark as New' : 'Mark as Viewed'}
                </button>

                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-[4px] uppercase"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
