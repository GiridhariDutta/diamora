import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical, 
  RefreshCw, 
  X, 
  Gem,
  Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

const lightSwal = Swal.mixin({
  background: '#FFFFFF',
  color: '#0F172A',
  confirmButtonColor: '#D4AF37',
  cancelButtonColor: '#94A3B8',
  customClass: {
    popup: 'border border-slate-200 rounded-[4px] font-open-sans shadow-xl',
    confirmButton: 'text-slate-900 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]',
    cancelButton: 'text-slate-700 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]'
  }
});

export default function AdminDiamondQualityPage() {
  const [qualities, setQualities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuality, setEditingQuality] = useState(null);

  // Form states with explicit Clarity & Color fields
  const [formData, setFormData] = useState({
    clarity: '',
    color: '',
    title: '',
    ratePerCarat: '',
    order: 1,
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const limitDecimalPlaces = (val, maxDecimals = 3) => {
    if (val === '' || val === null || val === undefined) return '';
    const str = val.toString();
    if (str.includes('.')) {
      const [intPart, decPart] = str.split('.');
      return `${intPart}.${decPart.slice(0, maxDecimals)}`;
    }
    return str;
  };

  const fetchQualities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/diamond-qualities');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setQualities(res.data.data);
      } else {
        setQualities([]);
      }
    } catch (err) {
      console.warn('Diamond Qualities API fetch warning:', err.message);
      setQualities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualities();
  }, []);

  const handleOpenAddModal = () => {
    const nextOrder = qualities.length > 0 
      ? Math.max(...qualities.map(c => Number(c.order) || 0)) + 1 
      : 1;

    setFormData({
      clarity: '',
      color: '',
      title: '',
      ratePerCarat: '',
      order: nextOrder,
      status: 'Active'
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const clarityStr = (formData.clarity || '').trim();
    const colorStr = (formData.color || '').trim();
    const constructedTitle = (formData.title && formData.title.trim())
      ? formData.title.trim()
      : (colorStr ? `${clarityStr} (${colorStr})` : clarityStr);

    if (!constructedTitle) {
      setErrorMessage('Please enter Diamond Clarity / Quality grade.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/api/diamond-qualities', {
        clarity: clarityStr,
        color: colorStr,
        title: constructedTitle,
        ratePerCarat: Number(formData.ratePerCarat) || 0,
        order: Number(formData.order) || 1,
        status: formData.status || 'Active'
      });

      if (res.data?.success) {
        setIsAddModalOpen(false);
        fetchQualities();

        lightSwal.fire({
          icon: 'success',
          title: 'Diamond Quality Added!',
          text: `"${constructedTitle}" has been saved.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create diamond quality grade.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditingQuality(item);
    setFormData({
      clarity: item.clarity || '',
      color: item.color || '',
      title: item.title || '',
      ratePerCarat: item.ratePerCarat !== undefined ? item.ratePerCarat : '',
      order: item.order || 1,
      status: item.status || 'Active'
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingQuality) return;

    const clarityStr = (formData.clarity || '').trim();
    const colorStr = (formData.color || '').trim();
    const constructedTitle = (formData.title && formData.title.trim())
      ? formData.title.trim()
      : (colorStr ? `${clarityStr} (${colorStr})` : clarityStr);

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.put(`/api/diamond-qualities/${editingQuality.id}`, {
        clarity: clarityStr,
        color: colorStr,
        title: constructedTitle,
        ratePerCarat: Number(formData.ratePerCarat) || 0,
        order: Number(formData.order) || 1,
        status: formData.status || 'Active'
      });

      if (res.data?.success) {
        setIsEditModalOpen(false);
        setEditingQuality(null);
        fetchQualities();

        lightSwal.fire({
          icon: 'success',
          title: 'Diamond Quality Updated!',
          text: `"${constructedTitle}" updated successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update diamond quality.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuality = (item) => {
    lightSwal.fire({
      title: 'Delete Diamond Quality?',
      text: `Are you sure you want to remove "${item.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/diamond-qualities/${item.id}`);
          if (res.data?.success) {
            setQualities(prev => prev.filter(c => c.id !== item.id));
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Diamond quality removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete quality grade.'
          });
        }
      }
    });
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const updated = [...qualities];
    const draggedItemContent = updated.splice(dragItem.current, 1)[0];
    updated.splice(dragOverItem.current, 0, draggedItemContent);

    const reindexed = updated.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setQualities(reindexed);
    dragItem.current = null;
    dragOverItem.current = null;

    try {
      const res = await api.put('/api/diamond-qualities/reorder', {
        orderedItems: reindexed
      });
      if (res.data?.success) {
        lightSwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Display Order Saved!',
          showConfirmButton: false,
          timer: 1800
        });
      }
    } catch (err) {
      console.warn('Reorder API sync warning:', err.message);
    }
  };

  // Frontend Live Search Filtering (Without API call)
  const filteredQualities = qualities.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.clarity && item.clarity.toLowerCase().includes(q)) ||
      (item.color && item.color.toLowerCase().includes(q)) ||
      (item.ratePerCarat && item.ratePerCarat.toString().includes(q))
    );
  });

  return (
    <div className="space-y-3 font-open-sans">
      
      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
          <div className="shrink-0">
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <Gem className="w-4 h-4 text-amber-700" />
              Diamond Quality & Color Grade Master
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add diamond clarity & color grades with per-carat valuation rates (₹/Ct).
            </p>
          </div>

          {/* FRONTEND LIVE SEARCH FIELD IN MIDDLE GAP */}
          <div className="relative flex-1 max-w-sm w-full md:mx-4 my-1 md:my-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quality, clarity, or color grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded-[4px] text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition-all"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchQualities}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Qualities"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Diamond Quality</span>
            </button>
          </div>
        </div>

        {/* TABLE WITH DRAG AND DROP */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2 px-2.5 text-center w-10">Reorder</th>
                <th className="py-2 px-3">Quality Grade / Title</th>
                <th className="py-2 px-3">Clarity</th>
                <th className="py-2 px-3">Color</th>
                <th className="py-2 px-3 text-right">Rate / Carat (₹/Ct)</th>
                <th className="py-2 px-3 text-center">Order</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-dq-${n}`} className="animate-pulse bg-white">
                    <td className="py-2 px-2.5 text-center">
                      <div className="w-4 h-4 bg-slate-200 mx-auto rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-28 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-16 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-16 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="h-3 w-24 bg-slate-200 ml-auto rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="h-3 w-8 bg-slate-200 mx-auto rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-4 w-16 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredQualities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs font-medium">
                    {searchQuery ? (
                      <span>No quality grades match your search &ldquo;<strong>{searchQuery}</strong>&rdquo;.</span>
                    ) : (
                      'No data found.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredQualities.map((item, index) => (
                  <tr 
                    key={item.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`bg-white hover:bg-amber-50/40 transition-colors cursor-move ${
                      isDragging ? 'opacity-80' : ''
                    }`}
                  >
                    <td className="py-2 px-2.5 text-center text-slate-400 hover:text-amber-800">
                      <GripVertical className="w-4 h-4 mx-auto cursor-grab active:cursor-grabbing" title="Drag with mouse to reorder" />
                    </td>

                    <td className="py-2 px-3 font-semibold text-slate-900 text-xs">
                      {item.title}
                    </td>

                    <td className="py-2 px-3 font-medium text-slate-700 text-xs">
                      {item.clarity || item.title || '—'}
                    </td>

                    <td className="py-2 px-3 text-xs">
                      {item.color ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-[3px] font-semibold">
                          {item.color}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-light italic">None</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right font-mono font-semibold text-amber-900 text-xs">
                      {item.ratePerCarat ? `₹${Number(item.ratePerCarat).toLocaleString('en-IN', { maximumFractionDigits: 3 })}` : '₹0'}
                    </td>

                    <td className="py-2 px-3 text-center font-mono font-medium text-slate-800">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px]">
                        {item.order}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase inline-flex items-center gap-1 ${
                        item.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {item.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="Edit Quality"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuality(item)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-all"
                          title="Delete Quality"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD MODAL WITH EXPLICIT CLARITY & COLOR FIELDS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans">
          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 sm:p-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block">
                ADD DIAMOND QUALITY & COLOR
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Set Clarity and Color together with default per-carat rate (₹/Ct).
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CLARITY / QUALITY */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Diamond Clarity <span className="text-rose-600 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VVS-EF, VVS1, VS-GH, SI1"
                    value={formData.clarity}
                    onChange={(e) => {
                      const newClarity = e.target.value;
                      const constructed = newClarity.trim() + (formData.color.trim() ? ` (${formData.color.trim()})` : '');
                      setFormData({ ...formData, clarity: newClarity, title: constructed });
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

                {/* DIAMOND COLOR */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Diamond Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. D Color, E-F, G-H, Fancy Yellow"
                    value={formData.color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      const constructed = formData.clarity.trim() + (newColor.trim() ? ` (${newColor.trim()})` : '');
                      setFormData({ ...formData, color: newColor, title: constructed });
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* GENERATED FULL GRADE TITLE PREVIEW */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Combined Grade Title Preview
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VVS-EF (D Color)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-amber-50/70 border border-amber-300 rounded-[4px] text-xs font-bold text-amber-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* RATE PER CARAT */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Rate / Carat (₹/Ct)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="e.g. 75000"
                    value={formData.ratePerCarat}
                    onChange={(e) => setFormData({ ...formData, ratePerCarat: limitDecimalPlaces(e.target.value, 3) })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold font-mono text-slate-950 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

                {/* DISPLAY ORDER */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 font-mono shadow-2xs"
                  />
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-[4px] text-xs text-slate-900 uppercase tracking-wider font-semibold shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase disabled:opacity-50 shadow-2xs"
                >
                  {submitting ? 'Creating...' : 'Create Quality'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MODAL WITH EXPLICIT CLARITY & COLOR FIELDS */}
      {isEditModalOpen && editingQuality && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans">
          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 sm:p-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block">
                EDIT DIAMOND QUALITY & COLOR
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Update details for <span className="text-amber-900 font-semibold">{editingQuality.title}</span>
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CLARITY / QUALITY */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Diamond Clarity <span className="text-rose-600 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clarity}
                    onChange={(e) => {
                      const newClarity = e.target.value;
                      const constructed = newClarity.trim() + (formData.color.trim() ? ` (${formData.color.trim()})` : '');
                      setFormData({ ...formData, clarity: newClarity, title: constructed });
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

                {/* DIAMOND COLOR */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Diamond Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      const constructed = formData.clarity.trim() + (newColor.trim() ? ` (${newColor.trim()})` : '');
                      setFormData({ ...formData, color: newColor, title: constructed });
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* COMBINED GRADE TITLE PREVIEW */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Combined Grade Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-amber-50/70 border border-amber-300 rounded-[4px] text-xs font-bold text-amber-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* RATE PER CARAT */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Rate / Carat (₹/Ct)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.ratePerCarat}
                    onChange={(e) => setFormData({ ...formData, ratePerCarat: limitDecimalPlaces(e.target.value, 3) })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold font-mono text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

                {/* DISPLAY ORDER */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 font-mono shadow-2xs"
                  />
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-[4px] text-xs text-slate-900 uppercase tracking-wider font-semibold shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase disabled:opacity-50 shadow-2xs"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
