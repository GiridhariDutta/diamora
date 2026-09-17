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
  X, 
  Truck,
  RotateCcw,
  AlertTriangle,
  FileText,
  CreditCard,
  History,
  ChevronRight,
  Filter,
  ChevronDown
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
    confirmButton: 'text-[#0C0D10] font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]',
    cancelButton: 'text-slate-700 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]'
  }
});

// Status configurations for Paid Orders
const PAID_STATUS_CONFIG = {
  pending: {
    label: 'Pending Approval',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    dotClass: 'bg-amber-500 animate-pulse',
    icon: Clock
  },
  process: {
    label: 'Processing / Crafting',
    badgeClass: 'bg-blue-100 text-blue-950 border-blue-300',
    dotClass: 'bg-blue-600',
    icon: RefreshCw
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    dotClass: 'bg-emerald-600',
    icon: CheckCircle2
  },
  refund: {
    label: 'Refunded',
    badgeClass: 'bg-purple-100 text-purple-950 border-purple-300',
    dotClass: 'bg-purple-600',
    icon: RotateCcw
  },
  canceled: {
    label: 'Canceled',
    badgeClass: 'bg-rose-100 text-rose-950 border-rose-300',
    dotClass: 'bg-rose-600',
    icon: AlertTriangle
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'pending', 'process', 'delivered', 'refund', 'canceled'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      if (res.data?.success && Array.isArray(res.data.data)) {
        // Filter strictly for Paid Orders
        const paidOrdersOnly = res.data.data.filter(o => 
          o.orderType === 'paid_order' || 
          o.paymentStatus === 'Paid' || 
          !!o.razorpayOrderId || 
          !!o.razorpayPaymentId
        );
        setOrders(paidOrdersOnly);
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

  // Update Status Handler with timestamp logging
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const res = await api.put(`/api/orders/${orderId}/status`, { 
        status: newStatus,
        note: `Order status updated to ${PAID_STATUS_CONFIG[newStatus]?.label || newStatus}`
      });

      if (res.data?.success) {
        const updatedDoc = res.data.data;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedDoc } : o));
        
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(prev => ({ ...prev, ...updatedDoc }));
        }

        lightSwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Order Status Updated to "${PAID_STATUS_CONFIG[newStatus]?.label || newStatus}"`,
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (err) {
      lightSwal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        text: err.response?.data?.message || err.message || 'Could not update order status.'
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = (order) => {
    lightSwal.fire({
      title: 'Delete Paid Order Record?',
      text: `Are you sure you want to delete order #${order.id?.slice(-8)} from "${order.customerName}"?`,
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
              text: 'Order record deleted.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete order.'
          });
        }
      }
    });
  };

  // Filtered orders computation
  const filteredOrders = orders.filter(o => {
    const normStatus = (o.status || 'pending').toLowerCase();
    
    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'pending' && normStatus !== 'pending') return false;
      if (statusFilter === 'process' && normStatus !== 'process' && normStatus !== 'processing') return false;
      if (statusFilter === 'delivered' && normStatus !== 'delivered') return false;
      if (statusFilter === 'refund' && normStatus !== 'refund' && normStatus !== 'refunded') return false;
      if (statusFilter === 'canceled' && normStatus !== 'canceled' && normStatus !== 'cancle' && normStatus !== 'cancelled') return false;
    }

    // Search Filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (o.id && o.id.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(term)) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(term)) ||
      (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(term)) ||
      (o.productTitle && o.productTitle.toLowerCase().includes(term))
    );
  });

  // Stats calculation
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length;
  const processCount = orders.filter(o => ['process', 'processing'].includes((o.status || '').toLowerCase())).length;
  const deliveredCount = orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length;
  const refundCount = orders.filter(o => ['refund', 'refunded'].includes((o.status || '').toLowerCase())).length;
  const canceledCount = orders.filter(o => ['canceled', 'cancle', 'cancelled'].includes((o.status || '').toLowerCase())).length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4 font-open-sans">
      
      {/* METRICS HEADER CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* TOTAL PAID ORDERS */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
            Total Orders
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono">{totalCount}</span>
        </div>

        {/* PENDING */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs">
          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block mb-0.5">
            Pending
          </span>
          <span className="text-xl font-bold text-amber-900 font-mono">{pendingCount}</span>
        </div>

        {/* PROCESSING */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs">
          <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block mb-0.5">
            In Process
          </span>
          <span className="text-xl font-bold text-blue-900 font-mono">{processCount}</span>
        </div>

        {/* DELIVERED */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs">
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block mb-0.5">
            Delivered
          </span>
          <span className="text-xl font-bold text-emerald-900 font-mono">{deliveredCount}</span>
        </div>

        {/* REFUND / CANCELED */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs">
          <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider block mb-0.5">
            Refund / Canceled
          </span>
          <span className="text-xl font-bold text-rose-900 font-mono">{refundCount + canceledCount}</span>
        </div>

        {/* TOTAL REVENUE */}
        <div className="bg-white border border-amber-300 rounded-[4px] p-3 shadow-2xs bg-amber-50/40">
          <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider block mb-0.5">
            Total Revenue
          </span>
          <span className="text-lg font-bold text-amber-900 font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-4 shadow-2xs">
        
        {/* HEADER & FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              Paid Razorpay Orders
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage completed payments, update order status timeline (pending, process, delivered, refund, canceled)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter Dropdown Select */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs cursor-pointer appearance-none uppercase tracking-wider"
              >
                <option value="All">All Statuses ({totalCount})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="process">Processing ({processCount})</option>
                <option value="delivered">Delivered ({deliveredCount})</option>
                <option value="refund">Refunded ({refundCount})</option>
                <option value="canceled">Canceled ({canceledCount})</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search order ID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 w-44 sm:w-56 shadow-2xs"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchOrders}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

          </div>
        </div>

        {/* PAID ORDERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Customer Details</th>
                <th className="py-2.5 px-3">Items / Product</th>
                <th className="py-2.5 px-3">Amount & Payment</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Change Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={`skel-pord-${n}`} className="animate-pulse bg-white">
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-32 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-40 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-20 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-6 w-24 bg-slate-200 rounded-[4px] ml-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-medium">
                    No paid orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const normStatus = (order.status || 'pending').toLowerCase();
                  const statusCfg = PAID_STATUS_CONFIG[normStatus] || {
                    label: order.status || 'Pending',
                    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
                    dotClass: 'bg-slate-500'
                  };

                  const formattedDate = formatDate(order.createdAt);

                  return (
                    <tr key={order.id} className="bg-white hover:bg-slate-50 transition-colors">
                      
                      {/* ORDER REF */}
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-slate-900 block text-xs">
                          #{order.id?.slice(-8)?.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{formattedDate}</span>
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
                            <a href={`tel:${order.customerPhone}`} className="hover:text-amber-800 hover:underline">
                              {order.customerPhone}
                            </a>
                          </div>

                          {order.city && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                              {order.city}, {order.state}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ITEMS / PRODUCTS */}
                      <td className="py-3 px-3">
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          <div className="flex items-center gap-2">
                            {order.items[0].image ? (
                              <img src={order.items[0].image} alt={order.items[0].title} className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0" />
                            ) : null}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-xs truncate max-w-[170px]">
                                {order.items[0].title}
                              </p>
                              {order.items.length > 1 && (
                                <span className="text-[9.5px] font-semibold text-amber-800">
                                  + {order.items.length - 1} more item(s)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                              {order.productTitle || 'Haute Joaillerie Item'}
                            </p>
                            {order.productSku && (
                              <span className="text-[10px] font-mono text-slate-500 block">SKU: {order.productSku}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* AMOUNT & PAYMENT */}
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-mono font-bold text-emerald-700 text-xs block">
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {order.paymentMethod || 'Razorpay Online'}
                          </span>
                          {order.razorpayPaymentId && (
                            <span className="text-[9.5px] font-mono text-slate-400 block truncate max-w-[120px]">
                              ID: {order.razorpayPaymentId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CURRENT STATUS BADGE */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-[3px] text-[9.5px] font-semibold uppercase border inline-flex items-center gap-1.5 ${statusCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* STATUS ACTIONS */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Status Change Dropdown Selector */}
                          <select
                            value={normStatus}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={updatingStatusId === order.id}
                            className="bg-slate-100 border border-slate-300 rounded-[4px] px-2 py-1 text-[10.5px] font-semibold text-slate-800 focus:outline-none focus:border-amber-600 transition-all cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="process">Processing</option>
                            <option value="delivered">Delivered</option>
                            <option value="refund">Refunded</option>
                            <option value="canceled">Canceled</option>
                          </select>

                          {/* Detail Modal Trigger */}
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-amber-800 rounded-[4px] transition-colors"
                            title="View Full Details & Status Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-colors"
                            title="Delete Order Record"
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

      {/* DETAIL & TIMELINE HISTORY MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs font-open-sans animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pb-2 border-b border-slate-200">
              <span className="text-[10px] font-semibold tracking-widest text-emerald-800 uppercase block">
                PAID RAZORPAY ORDER RECORD
              </span>
              <h3 className="text-base font-bold text-slate-950 font-mono">
                Order #{selectedOrderDetails.id}
              </h3>
              <p className="text-xs text-slate-500">
                Placed on: {formatDate(selectedOrderDetails.createdAt)}
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-800">
              
              {/* CURRENT STATUS SELECTOR IN MODAL */}
              <div className="p-3 bg-amber-50/60 rounded-[4px] border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider">
                    Current Order Status
                  </span>
                  <span className="font-bold text-slate-900 text-xs capitalize">
                    {PAID_STATUS_CONFIG[selectedOrderDetails.status?.toLowerCase()]?.label || selectedOrderDetails.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Update:</span>
                  <select
                    value={(selectedOrderDetails.status || 'pending').toLowerCase()}
                    onChange={(e) => handleUpdateStatus(selectedOrderDetails.id, e.target.value)}
                    className="bg-white border border-amber-400 rounded-[4px] px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="process">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="refund">Refunded</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>

              {/* STATUS CHANGE TIMELINE LOG */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-700" />
                  <span>Status Transition History & Date-Time Log</span>
                </span>
                {Array.isArray(selectedOrderDetails.statusHistory) && selectedOrderDetails.statusHistory.length > 0 ? (
                  <div className="space-y-2 pl-2 border-l-2 border-amber-300 my-1">
                    {selectedOrderDetails.statusHistory.map((h, idx) => (
                      <div key={idx} className="relative pl-3 text-xs">
                        <div className="absolute -left-[11px] top-1.5 w-2 h-2 rounded-full bg-amber-600" />
                        <div className="flex items-center justify-between font-medium">
                          <span className="font-bold text-slate-900 uppercase text-[10.5px]">
                            {PAID_STATUS_CONFIG[h.status?.toLowerCase()]?.label || h.status}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {formatDate(h.updatedAt)}
                          </span>
                        </div>
                        {h.note && (
                          <p className="text-[10.5px] text-slate-600 italic mt-0.5">{h.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10.5px] text-slate-500 italic">
                    Initial status logged on {formatDate(selectedOrderDetails.createdAt)}
                  </div>
                )}
              </div>

              {/* CUSTOMER INFO */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                  Customer & Delivery Contact
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Name</span>
                    <span className="font-bold text-slate-900">{selectedOrderDetails.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Phone</span>
                    <a href={`tel:${selectedOrderDetails.customerPhone}`} className="font-bold text-amber-900 hover:underline font-mono">
                      {selectedOrderDetails.customerPhone}
                    </a>
                  </div>
                  {selectedOrderDetails.customerEmail && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Email</span>
                      <span className="font-medium text-slate-700">{selectedOrderDetails.customerEmail}</span>
                    </div>
                  )}
                  {selectedOrderDetails.shippingAddress && (
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase block">Full Delivery Address</span>
                      <p className="text-slate-900 font-medium">
                        {selectedOrderDetails.shippingAddress}
                        {selectedOrderDetails.landmark ? ` (Landmark: ${selectedOrderDetails.landmark})` : ''}
                        , {selectedOrderDetails.city}, {selectedOrderDetails.state} - {selectedOrderDetails.pincode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RAZORPAY PAYMENT DETAILS */}
              <div className="p-3 bg-emerald-50/50 rounded-[4px] border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-semibold text-emerald-900 uppercase block tracking-wider">
                  Razorpay Transaction Info
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Payment Gateway</span>
                    <span className="font-bold text-slate-900">{selectedOrderDetails.paymentMethod || 'Razorpay Online'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Paid Total</span>
                    <span className="font-bold text-emerald-700">₹{Number(selectedOrderDetails.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrderDetails.razorpayPaymentId && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Razorpay Payment ID</span>
                      <span className="text-slate-900 font-bold">{selectedOrderDetails.razorpayPaymentId}</span>
                    </div>
                  )}
                  {selectedOrderDetails.razorpayOrderId && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Razorpay Order ID</span>
                      <span className="text-slate-700">{selectedOrderDetails.razorpayOrderId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PURCHASED ITEMS */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                  Purchased Items
                </span>
                {Array.isArray(selectedOrderDetails.items) && selectedOrderDetails.items.length > 0 ? (
                  <div className="space-y-2 divide-y divide-slate-200">
                    {selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover border border-slate-300" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                            <p className="text-[10.5px] text-slate-500 font-mono">Qty: {item.quantity || 1} × ₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ₹{(Number(item.price || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {selectedOrderDetails.productImage && (
                      <img src={selectedOrderDetails.productImage} alt="Product" className="w-14 h-14 rounded object-cover border border-slate-300" />
                    )}
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-900">{selectedOrderDetails.productTitle}</p>
                      <p className="font-mono font-bold text-amber-900">₹{Number(selectedOrderDetails.totalAmount || selectedOrderDetails.productPrice || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL CLOSE */}
              <div className="pt-2 flex items-center justify-end border-t border-slate-200">
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
