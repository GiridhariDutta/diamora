import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar, 
  ShoppingBag,
  X, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  IndianRupee
} from 'lucide-react';
import api from '../../api/axios';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1, page: 1, limit: 10 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const PAGE_LIMIT = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch customers from backend API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/customers', {
        params: {
          page: currentPage,
          limit: PAGE_LIMIT,
          search: debouncedSearch
        }
      });
      if (res.data?.success) {
        setCustomers(res.data.data || []);
        setPagination(res.data.pagination || { totalCount: 0, totalPages: 1, page: 1, limit: PAGE_LIMIT });
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.warn('Failed to fetch customers:', err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return isoStr;
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    if (num === 0) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Pagination handlers
  const goToPage = (page) => {
    const safePage = Math.max(1, Math.min(page, pagination.totalPages));
    setCurrentPage(safePage);
  };

  return (
    <div className="space-y-4 font-open-sans">
      
      {/* METRICS HEADER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* TOTAL CUSTOMERS */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Total Clients
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{pagination.totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* CURRENT PAGE INFO */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Showing Page
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {pagination.page} <span className="text-sm font-normal text-slate-400">/ {pagination.totalPages}</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* PER PAGE */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Per Page
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{PAGE_LIMIT}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-4 shadow-2xs">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-700" />
              Customer & Client Directory
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Real-time registered customers with order statistics and spending history
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 w-52 sm:w-64 shadow-2xs"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchCustomers}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Customer List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>
          </div>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2.5 px-3">Client Name</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Orders</th>
                <th className="py-2.5 px-3">Total Spent</th>
                <th className="py-2.5 px-3">Joined</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-cust-${n}`} className="animate-pulse bg-white">
                    <td className="py-3 px-3"><div className="h-4 w-28 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-36 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-10 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-6 w-16 bg-slate-200 rounded-[4px] ml-auto" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="text-slate-500 text-xs font-medium">
                        {debouncedSearch ? `No customers found matching "${debouncedSearch}"` : 'No registered customers found yet.'}
                      </span>
                      {debouncedSearch && (
                        <button
                          onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
                          className="text-[10.5px] text-amber-800 font-semibold hover:underline"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id || customer.uid} className="bg-white hover:bg-slate-50 transition-colors">
                    
                    {/* CLIENT NAME */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                          {customer.name ? customer.name.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-xs truncate max-w-[160px]">
                            {customer.name || 'Unknown'}
                          </p>
                          {customer.role && customer.role !== 'customer' && (
                            <span className="text-[9px] font-semibold text-purple-700 uppercase">{customer.role}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        {customer.email && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                            <Phone className="w-3 h-3 text-amber-800 shrink-0" />
                            <a href={`tel:${customer.phone}`} className="hover:text-amber-800 hover:underline">
                              {customer.phone}
                            </a>
                          </div>
                        )}
                        {!customer.email && !customer.phone && (
                          <span className="text-[10px] text-slate-400 italic">No contact info</span>
                        )}
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="py-3 px-3">
                      {customer.city || customer.state ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">—</span>
                      )}
                    </td>

                    {/* ORDERS COUNT */}
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold text-xs ${customer.ordersCount > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                        {customer.ordersCount}
                      </span>
                    </td>

                    {/* TOTAL SPENT */}
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold text-xs ${customer.totalSpent > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>

                    {/* JOINED DATE */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-[10.5px] text-slate-600 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(customer.joined)}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-amber-800 rounded-[4px] transition-colors"
                        title="View Customer Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200">
            <span className="text-[10.5px] text-slate-500 font-medium">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} customers
            </span>
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-1 bg-white border border-slate-300 rounded-[4px] text-slate-600 hover:text-amber-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              {/* Previous Page */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 bg-white border border-slate-300 rounded-[4px] text-slate-600 hover:text-amber-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Number Buttons */}
              {(() => {
                const pages = [];
                const totalPages = pagination.totalPages;
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, currentPage + 2);

                if (endPage - startPage < 4) {
                  if (startPage === 1) endPage = Math.min(totalPages, startPage + 4);
                  else startPage = Math.max(1, endPage - 4);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`min-w-[28px] h-7 px-1 text-[10.5px] font-semibold rounded-[4px] border transition-all ${
                        i === currentPage
                          ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-amber-800'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              {/* Next Page */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-1 bg-white border border-slate-300 rounded-[4px] text-slate-600 hover:text-amber-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {/* Last Page */}
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className="p-1 bg-white border border-slate-300 rounded-[4px] text-slate-600 hover:text-amber-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs font-open-sans animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pb-2 border-b border-slate-200">
              <span className="text-[10px] font-semibold tracking-widest text-amber-800 uppercase block">
                CLIENT PROFILE DETAILS
              </span>
              <h3 className="text-base font-bold text-slate-950 font-open-sans uppercase">
                {selectedCustomer.name || 'Customer'}
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-800">
              
              {/* CONTACT INFO */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                  Contact Information
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Name</span>
                    <span className="font-bold text-slate-900">{selectedCustomer.name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Phone</span>
                    {selectedCustomer.phone ? (
                      <a href={`tel:${selectedCustomer.phone}`} className="font-bold text-amber-900 hover:underline font-mono">
                        {selectedCustomer.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                  {selectedCustomer.email && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Email</span>
                      <span className="font-medium text-slate-700 font-mono">{selectedCustomer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LOCATION */}
              {(selectedCustomer.city || selectedCustomer.state) && (
                <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider mb-1">
                    Location
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{[selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
              )}

              {/* ORDER STATS */}
              <div className="p-3 bg-amber-50/60 rounded-[4px] border border-amber-200 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider">
                    Total Orders
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-mono">{selectedCustomer.ordersCount || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider">
                    Total Spent
                  </span>
                  <span className="text-lg font-bold text-emerald-700 font-mono">{formatCurrency(selectedCustomer.totalSpent)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider">
                    Last Order
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{formatDate(selectedCustomer.lastOrderDate)}</span>
                </div>
              </div>

              {/* REGISTRATION INFO */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider mb-1">
                  Registration
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined on {formatDate(selectedCustomer.joined)}</span>
                </div>
              </div>

              {/* CLOSE */}
              <div className="pt-2 flex items-center justify-end border-t border-slate-200">
                <button
                  onClick={() => setSelectedCustomer(null)}
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
