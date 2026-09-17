import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight,
  MessageSquare,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Eye,
  Phone,
  Calendar,
  Sparkles,
  FolderTree,
  Boxes
} from 'lucide-react';
import api from '../../api/axios';

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalCategories: 0,
    totalCollections: 0,
    // Paid Orders
    paidOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    refundedOrders: 0,
    canceledOrders: 0,
    // Inquiries
    totalInquiries: 0,
    newInquiries: 0,
    viewedInquiries: 0,
    processInquiries: 0,
  });
  const [recentPaidOrders, setRecentPaidOrders] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, customersRes, categoriesRes, collectionsRes] = await Promise.allSettled([
        api.get('/api/orders'),
        api.get('/api/products'),
        api.get('/api/auth/customers', { params: { page: 1, limit: 1 } }),
        api.get('/api/categories'),
        api.get('/api/collections'),
      ]);

      // === ORDERS & INQUIRIES STATS ===
      let allOrders = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data?.success) {
        allOrders = ordersRes.value.data.data || [];
      }

      const paidOrders = allOrders.filter(o =>
        o.orderType === 'paid_order' || o.paymentStatus === 'Paid' || !!o.razorpayOrderId || !!o.razorpayPaymentId
      );
      const inquiries = allOrders.filter(o =>
        o.orderType === 'inquiry' || (!o.razorpayOrderId && !o.razorpayPaymentId && o.paymentStatus !== 'Paid')
      );

      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const pendingOrders = paidOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length;
      const processingOrders = paidOrders.filter(o => ['process', 'processing'].includes((o.status || '').toLowerCase())).length;
      const deliveredOrders = paidOrders.filter(o => (o.status || '').toLowerCase() === 'delivered').length;
      const refundedOrders = paidOrders.filter(o => ['refund', 'refunded'].includes((o.status || '').toLowerCase())).length;
      const canceledOrders = paidOrders.filter(o => ['canceled', 'cancle', 'cancelled'].includes((o.status || '').toLowerCase())).length;

      const newInquiries = inquiries.filter(o => (o.status || 'new').toLowerCase() === 'new').length;
      const viewedInquiries = inquiries.filter(o => (o.status || '').toLowerCase() === 'viewed').length;
      const processInquiries = inquiries.filter(o => ['process', 'processing'].includes((o.status || '').toLowerCase())).length;

      // === PRODUCTS ===
      let totalProducts = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        const pd = productsRes.value.data;
        totalProducts = pd.count || (Array.isArray(pd.data) ? pd.data.length : 0);
      }

      // === CUSTOMERS ===
      let totalCustomers = 0;
      if (customersRes.status === 'fulfilled' && customersRes.value?.data?.success) {
        totalCustomers = customersRes.value.data.pagination?.totalCount || 0;
      }

      // === CATEGORIES ===
      let totalCategories = 0;
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data) {
        const cd = categoriesRes.value.data;
        totalCategories = cd.count || (Array.isArray(cd.data) ? cd.data.length : 0);
      }

      // === COLLECTIONS ===
      let totalCollections = 0;
      if (collectionsRes.status === 'fulfilled' && collectionsRes.value?.data) {
        const cl = collectionsRes.value.data;
        totalCollections = cl.count || (Array.isArray(cl.data) ? cl.data.length : 0);
      }

      setStats({
        totalRevenue,
        totalProducts,
        totalCustomers,
        totalCategories,
        totalCollections,
        paidOrders: paidOrders.length,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        refundedOrders,
        canceledOrders,
        totalInquiries: inquiries.length,
        newInquiries,
        viewedInquiries,
        processInquiries,
      });

      // Recent 5 paid orders
      const sortedPaid = [...paidOrders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRecentPaidOrders(sortedPaid.slice(0, 5));

      // Recent 5 inquiries
      const sortedInq = [...inquiries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRecentInquiries(sortedInq.slice(0, 5));

    } catch (err) {
      console.warn('Dashboard data fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return isoStr; }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const SkeletonCard = () => (
    <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-7 w-7 bg-slate-200 rounded-[4px]" />
      </div>
      <div className="h-6 w-28 bg-slate-200 rounded mb-1" />
      <div className="h-3 w-24 bg-slate-200 rounded" />
    </div>
  );

  return (
    <div className="space-y-3 font-open-sans">

      {/* REFRESH HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Business Overview</h3>
          <p className="text-[10.5px] text-slate-500">Real-time metrics from your store</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-1.5 bg-white border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Refresh Dashboard"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
        </button>
      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* TOTAL REVENUE */}
            <div className="bg-white border border-amber-300 rounded-[4px] p-3.5 shadow-2xs bg-amber-50/40 hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Total Revenue</span>
                <div className="p-1 rounded-[3px] bg-amber-100 text-amber-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-open-sans text-base sm:text-lg font-bold text-amber-900 font-mono">{formatCurrency(stats.totalRevenue)}</h3>
              <span className="text-[10px] text-emerald-600 font-medium">From {stats.paidOrders} paid orders</span>
            </div>

            {/* PAID ORDERS */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs hover:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Paid Orders</span>
                <div className="p-1 rounded-[3px] bg-emerald-50 text-emerald-700">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-open-sans text-base sm:text-lg font-bold text-slate-900 font-mono">{stats.paidOrders}</h3>
              <span className="text-[10px] text-amber-700 font-medium">{stats.pendingOrders} pending</span>
            </div>

            {/* INQUIRIES */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs hover:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Inquiries</span>
                <div className="p-1 rounded-[3px] bg-blue-50 text-blue-700">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-open-sans text-base sm:text-lg font-bold text-slate-900 font-mono">{stats.totalInquiries}</h3>
              <span className="text-[10px] text-amber-700 font-medium">{stats.newInquiries} new</span>
            </div>

            {/* PRODUCTS */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs hover:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Products</span>
                <div className="p-1 rounded-[3px] bg-amber-50 text-amber-700">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-open-sans text-base sm:text-lg font-bold text-slate-900 font-mono">{stats.totalProducts}</h3>
              <span className="text-[10px] text-slate-500 font-medium">In inventory</span>
            </div>

            {/* CUSTOMERS */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs hover:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Clients</span>
                <div className="p-1 rounded-[3px] bg-purple-50 text-purple-700">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-open-sans text-base sm:text-lg font-bold text-slate-900 font-mono">{stats.totalCustomers}</h3>
              <span className="text-[10px] text-slate-500 font-medium">Registered</span>
            </div>

            {/* CATEGORIES */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs hover:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Categories</span>
                <div className="p-1 rounded-[3px] bg-amber-50 text-amber-700">
                  <FolderTree className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-open-sans text-base sm:text-lg font-bold text-slate-900 font-mono">{stats.totalCategories}</h3>
              <span className="text-[10px] text-slate-500 font-medium">{stats.totalCollections} collections</span>
            </div>
          </>
        )}
      </div>

      {/* ORDER STATUS BREAKDOWN */}
      {!loading && stats.paidOrders > 0 && (
        <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Order Status Breakdown</h3>
              <p className="text-[10.5px] text-slate-500">Paid order statuses at a glance</p>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-amber-800 hover:text-amber-900 border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-[4px] uppercase tracking-wider transition-colors"
            >
              <ArrowUpRight className="w-3 h-3" /> View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: 'Pending', count: stats.pendingOrders, icon: Clock, color: 'amber', dotClass: 'bg-amber-500 animate-pulse' },
              { label: 'Processing', count: stats.processingOrders, icon: RefreshCw, color: 'blue', dotClass: 'bg-blue-600' },
              { label: 'Delivered', count: stats.deliveredOrders, icon: Truck, color: 'emerald', dotClass: 'bg-emerald-600' },
              { label: 'Refunded', count: stats.refundedOrders, icon: RotateCcw, color: 'purple', dotClass: 'bg-purple-600' },
              { label: 'Canceled', count: stats.canceledOrders, icon: AlertTriangle, color: 'rose', dotClass: 'bg-rose-600' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`p-2.5 rounded-[4px] border border-${item.color}-200 bg-${item.color}-50/50 flex items-center gap-2.5`}>
                  <div className={`w-2 h-2 rounded-full ${item.dotClass} shrink-0`} />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">{item.label}</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TWO COLUMN: RECENT PAID ORDERS + RECENT INQUIRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* RECENT PAID ORDERS */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" /> Recent Paid Orders
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-[10.5px] font-semibold text-amber-800 hover:text-amber-900 hover:underline uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse flex items-center gap-3 py-2">
                  <div className="h-8 w-8 bg-slate-200 rounded-[4px]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                    <div className="h-2.5 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : recentPaidOrders.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingBag className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
              <span className="text-xs text-slate-500">No paid orders yet</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPaidOrders.map((order) => {
                const normStatus = (order.status || 'pending').toLowerCase();
                const statusColors = {
                  pending: 'bg-amber-100 text-amber-900 border-amber-300',
                  process: 'bg-blue-100 text-blue-900 border-blue-300',
                  processing: 'bg-blue-100 text-blue-900 border-blue-300',
                  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  refund: 'bg-purple-100 text-purple-900 border-purple-300',
                  refunded: 'bg-purple-100 text-purple-900 border-purple-300',
                  canceled: 'bg-rose-100 text-rose-900 border-rose-300',
                };
                const badgeClass = statusColors[normStatus] || 'bg-slate-100 text-slate-800 border-slate-300';

                return (
                  <div key={order.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] font-mono shrink-0">
                        #{order.id?.slice(-4)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate max-w-[140px]">
                          {order.customerName || 'Customer'}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase border ${badgeClass}`}>
                        {normStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENT INQUIRIES */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" /> Recent Inquiries
              </h3>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-[10.5px] font-semibold text-amber-800 hover:text-amber-900 hover:underline uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse flex items-center gap-3 py-2">
                  <div className="h-8 w-8 bg-slate-200 rounded-[4px]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                    <div className="h-2.5 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-14 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : recentInquiries.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
              <span className="text-xs text-slate-500">No inquiries yet</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentInquiries.map((inq) => {
                const normStatus = (inq.status || 'new').toLowerCase();
                const statusColors = {
                  new: 'bg-amber-100 text-amber-900 border-amber-300',
                  viewed: 'bg-blue-100 text-blue-900 border-blue-300',
                  process: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  processing: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                };
                const badgeClass = statusColors[normStatus] || 'bg-slate-100 text-slate-800 border-slate-300';

                return (
                  <div key={inq.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {inq.productImage ? (
                        <img src={inq.productImage} alt="" className="w-8 h-8 rounded-[4px] object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate max-w-[140px]">
                          {inq.customerName || 'Client'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {inq.productTitle || 'Product Inquiry'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {inq.customerPhone && (
                        <a href={`tel:${inq.customerPhone}`} className="text-amber-800 hover:text-amber-900">
                          <Phone className="w-3 h-3" />
                        </a>
                      )}
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase border ${badgeClass}`}>
                        {normStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: 'Paid Orders', path: '/admin/orders', icon: ShoppingBag, color: 'emerald' },
            { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare, color: 'blue' },
            { label: 'Inventory', path: '/admin/inventory', icon: Package, color: 'amber' },
            { label: 'Customers', path: '/admin/customers', icon: Users, color: 'purple' },
            { label: 'Categories', path: '/admin/categories', icon: FolderTree, color: 'slate' },
            { label: 'Collections', path: '/admin/collections', icon: Boxes, color: 'slate' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-[4px] transition-all group"
              >
                <Icon className={`w-4 h-4 text-${action.color}-600 group-hover:text-amber-700 transition-colors`} />
                <span className="text-[10.5px] font-semibold text-slate-700 group-hover:text-amber-900 uppercase tracking-wider transition-colors truncate">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
