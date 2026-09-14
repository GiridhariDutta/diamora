import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical, 
  RefreshCw, 
  X, 
  Sparkles,
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

export default function AdminStonesPage() {
  const [stones, setStones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStone, setEditingStone] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    ratePerCarat: '',
    order: 1,
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag and drop tracking
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to cap decimal inputs to at most 3 decimal places
  const limitDecimalPlaces = (val, maxDecimals = 3) => {
    if (val === '' || val === null || val === undefined) return '';
    const str = val.toString();
    if (str.includes('.')) {
      const [intPart, decPart] = str.split('.');
      return `${intPart}.${decPart.slice(0, maxDecimals)}`;
    }
    return str;
  };

  // Fetch stones from Backend API
  const fetchStones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/stones');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStones(res.data.data);
      } else {
        setStones([]);
      }
    } catch (err) {
      console.warn('Stones API fetch warning:', err.message);
      setStones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStones();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextOrder = stones.length > 0 
      ? Math.max(...stones.map(c => Number(c.order) || 0)) + 1 
      : 1;

    setFormData({
      title: '',
      ratePerCarat: '',
      order: nextOrder,
      status: 'Active'
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  // Submit Add Stone
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/api/stones', {
        ...formData,
        ratePerCarat: Number(formData.ratePerCarat) || 0
      });
      if (res.data?.success) {
        setIsAddModalOpen(false);
        fetchStones();

        lightSwal.fire({
          icon: 'success',
          title: 'Gemstone Created!',
          text: `"${formData.title}" has been saved.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create gemstone.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (st) => {
    setEditingStone(st);
    setFormData({
      title: st.title || '',
      ratePerCarat: st.ratePerCarat !== undefined ? st.ratePerCarat : '',
      order: st.order || 1,
      status: st.status || 'Active'
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Stone
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStone) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.put(`/api/stones/${editingStone.id}`, {
        ...formData,
        ratePerCarat: Number(formData.ratePerCarat) || 0
      });
      if (res.data?.success) {
        setIsEditModalOpen(false);
        setEditingStone(null);
        fetchStones();

        lightSwal.fire({
          icon: 'success',
          title: 'Gemstone Updated!',
          text: `"${formData.title}" updated successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update gemstone.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Stone
  const handleDeleteStone = (st) => {
    lightSwal.fire({
      title: 'Delete Gemstone?',
      text: `Are you sure you want to remove "${st.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/stones/${st.id}`);
          if (res.data?.success) {
            setStones(prev => prev.filter(c => c.id !== st.id));
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Gemstone has been removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete gemstone.'
          });
        }
      }
    });
  };

  // DRAG & DROP MOUSE REORDERING HANDLERS
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

    const updatedStones = [...stones];
    const draggedItemContent = updatedStones.splice(dragItem.current, 1)[0];
    updatedStones.splice(dragOverItem.current, 0, draggedItemContent);

    const reindexedStones = updatedStones.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setStones(reindexedStones);
    dragItem.current = null;
    dragOverItem.current = null;

    try {
      const res = await api.put('/api/stones/reorder', {
        orderedItems: reindexedStones
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
  const filteredStones = stones.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
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
              <Sparkles className="w-4 h-4 text-amber-700" />
              Gemstone / Stone Master
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage gemstone types (Ruby, Emerald, CZ, Pearl) with valuation rate per carat (₹/Ct).
            </p>
          </div>

          {/* FRONTEND LIVE SEARCH FIELD IN MIDDLE GAP */}
          <div className="relative flex-1 max-w-sm w-full md:mx-4 my-1 md:my-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search gemstone title or rate..."
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
              onClick={fetchStones}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Gemstones"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Gemstone</span>
            </button>
          </div>
        </div>

        {/* STONES TABLE WITH DRAG AND DROP */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2 px-2.5 text-center w-10">Reorder</th>
                <th className="py-2 px-3">Gemstone Title</th>
                <th className="py-2 px-3 text-right">Rate / Carat (₹/Ct)</th>
                <th className="py-2 px-3 text-center">Order</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-st-${n}`} className="animate-pulse bg-white">
                    <td className="py-2 px-2.5 text-center">
                      <div className="w-4 h-4 bg-slate-200 mx-auto rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-28 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="h-3 w-20 bg-slate-200 ml-auto rounded-[3px]" />
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
              ) : filteredStones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-medium">
                    {searchQuery ? (
                      <span>No gemstones match your search &ldquo;<strong>{searchQuery}</strong>&rdquo;.</span>
                    ) : (
                      'No data found.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredStones.map((st, index) => (
                  <tr 
                    key={st.id || index}
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
                      {st.title}
                    </td>

                    <td className="py-2 px-3 text-right font-mono font-semibold text-amber-900 text-xs">
                      {st.ratePerCarat ? `₹${Number(st.ratePerCarat).toLocaleString('en-IN', { maximumFractionDigits: 3 })}` : '₹0'}
                    </td>

                    <td className="py-2 px-3 text-center font-mono font-medium text-slate-800">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px]">
                        {st.order}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase inline-flex items-center gap-1 ${
                        st.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {st.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="Edit Gemstone"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteStone(st)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-all"
                          title="Delete Gemstone"
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

      {/* MODAL 1: ADD GEMSTONE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans">
          <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 sm:p-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block">
                ADD NEW GEMSTONE / STONE
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Creates a new gemstone option (e.g. Ruby, Emerald, Sapphire, CZ)
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Gemstone Title <span className="text-rose-600 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruby (Natural), Emerald, CZ"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Rate / Carat (₹/Ct)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="e.g. 15000"
                    value={formData.ratePerCarat}
                    onChange={(e) => setFormData({ ...formData, ratePerCarat: limitDecimalPlaces(e.target.value, 3) })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold font-mono text-slate-950 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  {submitting ? 'Creating...' : 'Create Gemstone'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT GEMSTONE MODAL */}
      {isEditModalOpen && editingStone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans">
          <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 sm:p-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block">
                EDIT GEMSTONE
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Update details for <span className="text-amber-900 font-semibold">{editingStone.title}</span>
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                    Gemstone Title <span className="text-rose-600 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
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
