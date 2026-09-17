import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
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
  Filter,
  History,
  Tag,
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

// Status configurations for Product Inquiries
const INQUIRY_STATUS_CONFIG = {
  new: {
    label: 'New / Unread',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs',
    dotClass: 'bg-amber-600 animate-pulse',
    icon: Clock
  },
  viewed: {
    label: 'Viewed',
    badgeClass: 'bg-blue-100 text-blue-950 border-blue-300',
    dotClass: 'bg-blue-600',
    icon: Eye
  },
  process: {
    label: 'In Process',
    badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    dotClass: 'bg-emerald-600',
    icon: CheckCircle2
  }
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'new', 'viewed', 'process'
  const [selectedInquiryDetails, setSelectedInquiryDetails] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Fetch inquiries from API
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      if (res.data?.success && Array.isArray(res.data.data)) {
        // Filter strictly for Product Inquiries (non-paid)
        const inquiriesOnly = res.data.data.filter(o => 
          o.orderType === 'inquiry' || 
          (!o.razorpayOrderId && !o.razorpayPaymentId && o.paymentStatus !== 'Paid')
        );
        setInquiries(inquiriesOnly);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.warn('Inquiries API fetch warning:', err.message);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update Status Handler with timestamp logging
  const handleUpdateStatus = async (inquiryId, newStatus) => {
    setUpdatingStatusId(inquiryId);
    try {
      const res = await api.put(`/api/orders/${inquiryId}/status`, { 
        status: newStatus,
        note: `Inquiry status changed to ${INQUIRY_STATUS_CONFIG[newStatus]?.label || newStatus}`
      });

      if (res.data?.success) {
        const updatedDoc = res.data.data;
        setInquiries(prev => prev.map(o => o.id === inquiryId ? { ...o, ...updatedDoc } : o));
        
        if (selectedInquiryDetails?.id === inquiryId) {
          setSelectedInquiryDetails(prev => ({ ...prev, ...updatedDoc }));
        }

        lightSwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Inquiry Status Marked as "${INQUIRY_STATUS_CONFIG[newStatus]?.label || newStatus}"`,
          showConfirmButton: false,
          timer: 1800
        });
      }
    } catch (err) {
      lightSwal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        text: err.response?.data?.message || err.message || 'Could not update inquiry status.'
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete Inquiry Handler
  const handleDeleteInquiry = (inquiry) => {
    lightSwal.fire({
      title: 'Delete Product Inquiry?',
      text: `Are you sure you want to delete inquiry from "${inquiry.customerName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/orders/${inquiry.id}`);
          if (res.data?.success) {
            setInquiries(prev => prev.filter(o => o.id !== inquiry.id));
            if (selectedInquiryDetails?.id === inquiry.id) {
              setSelectedInquiryDetails(null);
            }
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Inquiry record removed.',
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

  // Filtered inquiries computation
  const filteredInquiries = inquiries.filter(o => {
    const normStatus = (o.status || 'new').toLowerCase();
    
    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'new' && normStatus !== 'new') return false;
      if (statusFilter === 'viewed' && normStatus !== 'viewed') return false;
      if (statusFilter === 'process' && normStatus !== 'process' && normStatus !== 'processing') return false;
    }

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
  const totalCount = inquiries.length;
  const newCount = inquiries.filter(o => (o.status || 'new').toLowerCase() === 'new').length;
  const viewedCount = inquiries.filter(o => (o.status || '').toLowerCase() === 'viewed').length;
  const processCount = inquiries.filter(o => ['process', 'processing'].includes((o.status || '').toLowerCase())).length;

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* TOTAL INQUIRIES */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Total Inquiries
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* NEW INQUIRIES */}
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

        {/* VIEWED */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-blue-800 uppercase tracking-wider block mb-0.5">
              Viewed / Reviewed
            </span>
            <span className="text-2xl font-bold text-blue-900 font-mono">{viewedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-[4px] bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* IN PROCESS */}
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5">
              In Process
            </span>
            <span className="text-2xl font-bold text-emerald-900 font-mono">{processCount}</span>
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
              <MessageSquare className="w-4 h-4 text-amber-700" />
              Client Product Consultations & Inquiries
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage client inquiries, update status transitions (new, viewed, process) with full timestamp log
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
                <option value="All">All Inquiries ({totalCount})</option>
                <option value="new">New / Unread ({newCount})</option>
                <option value="viewed">Viewed ({viewedCount})</option>
                <option value="process">In Process ({processCount})</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
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
              onClick={fetchInquiries}
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
                <th className="py-2.5 px-3">Customer Contact</th>
                <th className="py-2.5 px-3">Inquired Product</th>
                <th className="py-2.5 px-3">Notes & Metal Options</th>
                <th className="py-2.5 px-3">Inquiry Date</th>
                <th className="py-2.5 px-3 text-right">Update Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={`skel-inq-${n}`} className="animate-pulse bg-white">
                    <td className="py-3 px-3"><div className="h-5 w-16 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-32 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-40 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-28 bg-slate-200 rounded-[3px]" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-6 w-16 bg-slate-200 rounded-[4px] ml-auto" /></td>
                  </tr>
                ))
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-medium">
                    No product inquiries found.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const normStatus = (inquiry.status || 'new').toLowerCase();
                  const statusCfg = INQUIRY_STATUS_CONFIG[normStatus] || {
                    label: inquiry.status || 'New',
                    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
                    dotClass: 'bg-slate-500'
                  };

                  const formattedDate = formatDate(inquiry.createdAt);

                  return (
                    <tr 
                      key={inquiry.id}
                      className={`transition-colors ${
                        normStatus === 'new' ? 'bg-amber-50/40 hover:bg-amber-50/80 font-medium' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* STATUS BADGE */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-[3px] text-[9.5px] font-semibold uppercase border inline-flex items-center gap-1.5 ${statusCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* CUSTOMER DETAILS */}
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{inquiry.customerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-600">
                            <Phone className="w-3 h-3 text-amber-800" />
                            <a href={`tel:${inquiry.customerPhone}`} className="hover:text-amber-800 hover:underline">
                              {inquiry.customerPhone}
                            </a>
                          </div>

                          {inquiry.customerEmail && (
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 mt-0.5 truncate max-w-[190px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{inquiry.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* INQUIRED PRODUCT */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {inquiry.productImage ? (
                            <img src={inquiry.productImage} alt={inquiry.productTitle} className="w-10 h-10 rounded shadow-2xs object-cover border border-slate-200 shrink-0" />
                          ) : null}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                              {inquiry.productTitle || 'General Diamond Piece'}
                            </p>
                            {inquiry.productSku && (
                              <span className="text-[10px] font-mono text-slate-500 block">SKU: {inquiry.productSku}</span>
                            )}
                            {inquiry.productPrice ? (
                              <span className="text-[10.5px] font-mono font-semibold text-amber-900 block">
                                ₹{Number(inquiry.productPrice).toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* OPTIONS & NOTES */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {inquiry.selectedMetal && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px] text-slate-700 font-medium mr-1">
                              Metal: {inquiry.selectedMetal}
                            </span>
                          )}
                          {inquiry.selectedColor && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px] text-slate-700 font-medium">
                              Color: {inquiry.selectedColor}
                            </span>
                          )}
                          {inquiry.notes ? (
                            <p className="text-[10.5px] text-slate-600 italic truncate max-w-[180px]">
                              "{inquiry.notes}"
                            </p>
                          ) : !inquiry.selectedMetal && !inquiry.selectedColor ? (
                            <span className="text-slate-400 text-[10.5px] italic">No special notes</span>
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
                          
                          {/* Status Select */}
                          <select
                            value={normStatus}
                            onChange={(e) => handleUpdateStatus(inquiry.id, e.target.value)}
                            disabled={updatingStatusId === inquiry.id}
                            className="bg-slate-100 border border-slate-300 rounded-[4px] px-2 py-1 text-[10.5px] font-semibold text-slate-800 focus:outline-none focus:border-amber-600 transition-all cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="viewed">Viewed</option>
                            <option value="process">In Process</option>
                          </select>

                          {/* Detail Trigger */}
                          <button
                            onClick={() => setSelectedInquiryDetails(inquiry)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-amber-800 rounded-[4px] transition-colors"
                            title="View Inquiry Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteInquiry(inquiry)}
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

      {/* DETAIL MODAL & TIMELINE */}
      {selectedInquiryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs font-open-sans animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedInquiryDetails(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pb-2 border-b border-slate-200">
              <span className="text-[10px] font-semibold tracking-widest text-amber-800 uppercase block">
                PRODUCT INQUIRY DETAILS
              </span>
              <h3 className="text-base font-bold text-slate-950 font-open-sans uppercase">
                {selectedInquiryDetails.productTitle || 'Product Consultation'}
              </h3>
              <p className="text-xs text-slate-500">
                Inquiry Ref ID: <span className="font-mono">{selectedInquiryDetails.id}</span>
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-800">
              
              {/* STATUS CHANGE SELECTOR IN MODAL */}
              <div className="p-3 bg-amber-50/60 rounded-[4px] border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider">
                    Inquiry Status
                  </span>
                  <span className="font-bold text-slate-900 text-xs capitalize">
                    {INQUIRY_STATUS_CONFIG[selectedInquiryDetails.status?.toLowerCase()]?.label || selectedInquiryDetails.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Change to:</span>
                  <select
                    value={(selectedInquiryDetails.status || 'new').toLowerCase()}
                    onChange={(e) => handleUpdateStatus(selectedInquiryDetails.id, e.target.value)}
                    className="bg-white border border-amber-400 rounded-[4px] px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="viewed">Viewed</option>
                    <option value="process">In Process</option>
                  </select>
                </div>
              </div>

              {/* TIMELINE HISTORY */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-700" />
                  <span>Inquiry Status History & Date-Time Log</span>
                </span>
                {Array.isArray(selectedInquiryDetails.statusHistory) && selectedInquiryDetails.statusHistory.length > 0 ? (
                  <div className="space-y-2 pl-2 border-l-2 border-amber-300 my-1">
                    {selectedInquiryDetails.statusHistory.map((h, idx) => (
                      <div key={idx} className="relative pl-3 text-xs">
                        <div className="absolute -left-[11px] top-1.5 w-2 h-2 rounded-full bg-amber-600" />
                        <div className="flex items-center justify-between font-medium">
                          <span className="font-bold text-slate-900 uppercase text-[10.5px]">
                            {INQUIRY_STATUS_CONFIG[h.status?.toLowerCase()]?.label || h.status}
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
                    Inquiry submitted on {formatDate(selectedInquiryDetails.createdAt)}
                  </div>
                )}
              </div>

              {/* CUSTOMER CONTACT INFO */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                  Client Contact Information
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Name</span>
                    <span className="font-bold text-slate-900">{selectedInquiryDetails.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Phone</span>
                    <a href={`tel:${selectedInquiryDetails.customerPhone}`} className="font-bold text-amber-900 hover:underline font-mono">
                      {selectedInquiryDetails.customerPhone}
                    </a>
                  </div>
                  {selectedInquiryDetails.customerEmail && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Email</span>
                      <span className="font-medium text-slate-700">{selectedInquiryDetails.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* INQUIRED PRODUCT */}
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex items-start gap-3">
                {selectedInquiryDetails.productImage && (
                  <img src={selectedInquiryDetails.productImage} alt="Product" className="w-16 h-16 rounded object-cover border border-slate-300 shrink-0" />
                )}
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block tracking-wider">
                    Inquired Product Details
                  </span>
                  <p className="font-bold text-slate-900">{selectedInquiryDetails.productTitle}</p>
                  {selectedInquiryDetails.productSku && (
                    <p className="font-mono text-[10px] text-slate-500">SKU: {selectedInquiryDetails.productSku}</p>
                  )}
                  {selectedInquiryDetails.productPrice ? (
                    <p className="font-mono font-bold text-amber-900">₹{Number(selectedInquiryDetails.productPrice).toLocaleString('en-IN')}</p>
                  ) : null}
                </div>
              </div>

              {/* NOTES */}
              {selectedInquiryDetails.notes && (
                <div className="p-3 bg-amber-50/60 rounded-[4px] border border-amber-200">
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block tracking-wider mb-1">
                    Client Notes / Customization Request
                  </span>
                  <p className="text-slate-800 italic">"{selectedInquiryDetails.notes}"</p>
                </div>
              )}

              {/* CLOSE */}
              <div className="pt-2 flex items-center justify-end border-t border-slate-200">
                <button
                  onClick={() => setSelectedInquiryDetails(null)}
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
