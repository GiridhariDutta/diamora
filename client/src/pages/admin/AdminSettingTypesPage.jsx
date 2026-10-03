import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical, 
  RefreshCw, 
  X, 
  Palette,
  Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

// Executive Light styled SweetAlert2 configuration with ~4-5px border radius
const lightSwal = Swal.mixin({
  background: '#FFFFFF',
  SettingType: '#0F172A',
  confirmButtonSettingType: '#D4AF37',
  cancelButtonSettingType: '#94A3B8',
  customClass: {
    popup: 'border border-slate-200 rounded-[4px] font-open-sans shadow-xl',
    confirmButton: 'text-slate-900 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]',
    cancelButton: 'text-slate-700 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]'
  }
});

export default function AdminSettingTypesPage() {
  const [SettingTypes, setSettingTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSettingType, setEditingSettingType] = useState(null);

  // Form states (No Heading/Subtitle field as requested)
  const [formData, setFormData] = useState({
    title: '',
    order: 1,
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag and drop tracking
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch SettingTypes from Backend API
  const fetchSettingTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/setting-types');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSettingTypes(res.data.data);
      } else {
        setSettingTypes([]);
      }
    } catch (err) {
      console.warn('SettingTypes API fetch warning:', err.message);
      setSettingTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingTypes();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextOrder = SettingTypes.length > 0 
      ? Math.max(...SettingTypes.map(c => Number(c.order) || 0)) + 1 
      : 1;

    setFormData({
      title: '',
      order: nextOrder,
      status: 'Active'
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  // Submit Add SettingType
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/api/setting-types', formData);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        fetchSettingTypes();

        lightSwal.fire({
          icon: 'success',
          title: 'Setting Type Created!',
          text: `"${formData.title}" has been saved.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create SettingType.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (col) => {
    setEditingSettingType(col);
    setFormData({
      title: col.title || '',
      order: col.order || 1,
      status: col.status || 'Active'
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  // Submit Edit SettingType
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSettingType) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.put(`/api/setting-types/${editingSettingType.id}`, formData);
      if (res.data?.success) {
        setIsEditModalOpen(false);
        setEditingSettingType(null);
        fetchSettingTypes();

        lightSwal.fire({
          icon: 'success',
          title: 'Setting Type Updated!',
          text: `"${formData.title}" updated successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update SettingType.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete SettingType
  const handleDeleteSettingType = (col) => {
    lightSwal.fire({
      title: 'Delete Setting Type?',
      text: `Are you sure you want to remove "${col.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonSettingType: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/setting-types/${col.id}`);
          if (res.data?.success) {
            setSettingTypes(prev => prev.filter(c => c.id !== col.id));
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'SettingType has been removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete SettingType.'
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

    // Create reordered copy of SettingTypes array
    const updatedSettingTypes = [...SettingTypes];
    const draggedItemContent = updatedSettingTypes.splice(dragItem.current, 1)[0];
    updatedSettingTypes.splice(dragOverItem.current, 0, draggedItemContent);

    // Update order numbers sequentially (1, 2, 3...)
    const reindexedSettingTypes = updatedSettingTypes.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setSettingTypes(reindexedSettingTypes);

    dragItem.current = null;
    dragOverItem.current = null;

    // Save new order sequence to backend API
    try {
      const res = await api.put('/api/setting-types/reorder', {
        orderedItems: reindexedSettingTypes
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
  const filteredSettingTypes = SettingTypes.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3 font-open-sans">

      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
          <div className="shrink-0">
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-700" />
              Gold SettingType Management
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Drag rows with mouse to reorder display sequence or add new metal and gemstone gold SettingTypes
            </p>
          </div>

          {/* FRONTEND LIVE SEARCH FIELD IN MIDDLE GAP */}
          <div className="relative flex-1 max-w-sm w-full md:mx-4 my-1 md:my-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search gold SettingType title..."
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
              onClick={fetchSettingTypes}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-SettingTypes shadow-2xs"
              title="Refresh SettingTypes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Gold SettingType</span>
            </button>
          </div>
        </div>

        {/* SettingTypeS TABLE WITH DRAG AND DROP */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2 px-2.5 text-center w-10">Reorder</th>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3 text-center">Order</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-SettingType-${n}`} className="animate-pulse bg-white">
                    <td className="py-2 px-2.5 text-center">
                      <div className="w-4 h-4 bg-slate-200 mx-auto rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-28 bg-slate-200 rounded-[3px]" />
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
              ) : filteredSettingTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-medium">
                    {searchQuery ? (
                      <span>No gold SettingTypes match your search &ldquo;<strong>{searchQuery}</strong>&rdquo;.</span>
                    ) : (
                      'No data found.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredSettingTypes.map((col, index) => (
                  <tr 
                    key={col.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`bg-white hover:bg-amber-50/40 transition-SettingTypes cursor-move ${
                      isDragging ? 'opacity-80' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <td className="py-2 px-2.5 text-center text-slate-400 hover:text-amber-800">
                      <GripVertical className="w-4 h-4 mx-auto cursor-grab active:cursor-grabbing" title="Drag with mouse to reorder" />
                    </td>

                    {/* Title */}
                    <td className="py-2 px-3 font-semibold text-slate-900 text-xs">
                      {col.title}
                    </td>

                    {/* Order (No # symbol) */}
                    <td className="py-2 px-3 text-center font-mono font-medium text-slate-800">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px]">
                        {col.order}
                      </span>
                    </td>

                    {/* Status (Active = Green, Inactive = Red) */}
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase inline-flex items-center gap-1 ${
                        col.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${col.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {col.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(col)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="Edit SettingType"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSettingType(col)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-all"
                          title="Delete SettingType"
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

      {/* MODAL 1: ADD SettingType MODAL */}
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
                ADD NEW SETTING TYPE
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Creates a new SettingType option for catalog products
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              {/* TITLE */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Title <span className="text-rose-600 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yellow Gold, Rose Gold, Platinum"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              {/* ORDER & STATUS GRID */}
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
                  {submitting ? 'Creating...' : 'Create SettingType'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SETTING TYPE MODAL */}
      {isEditModalOpen && editingSettingType && (
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
                EDIT SETTING TYPE
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Update details for <span className="text-amber-900 font-semibold">{editingSettingType.title}</span>
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              {/* TITLE */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Title <span className="text-rose-600 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              {/* ORDER & STATUS GRID */}
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
