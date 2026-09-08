import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical, 
  RefreshCw, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles,
  Layers,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

// Executive Light styled SweetAlert2 configuration with ~4-5px border radius
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    heading: '',
    order: 1,
    status: 'Active',
    imageUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag and drop tracking
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch categories from Backend API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/categories');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.warn('Categories API fetch warning:', err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Image Upload Handler (Firebase Storage via backend API)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await api.post('/api/categories/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success && res.data?.data?.imageUrl) {
        setFormData(prev => ({
          ...prev,
          imageUrl: res.data.data.imageUrl
        }));

        lightSwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Image Uploaded to Firebase Storage!',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextOrder = categories.length > 0 
      ? Math.max(...categories.map(c => Number(c.order) || 0)) + 1 
      : 1;

    setFormData({
      title: '',
      heading: '',
      order: nextOrder,
      status: 'Active',
      imageUrl: ''
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  // Submit Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/api/categories', formData);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        fetchCategories();

        lightSwal.fire({
          icon: 'success',
          title: 'Category Created!',
          text: `"${formData.title}" has been saved.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title || '',
      heading: cat.heading || '',
      order: cat.order || 1,
      status: cat.status || 'Active',
      imageUrl: cat.imageUrl || ''
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Category
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.put(`/api/categories/${editingCategory.id}`, formData);
      if (res.data?.success) {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        fetchCategories();

        lightSwal.fire({
          icon: 'success',
          title: 'Category Updated!',
          text: `"${formData.title}" updated successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = (cat) => {
    lightSwal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to remove "${cat.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/categories/${cat.id}`);
          if (res.data?.success) {
            setCategories(prev => prev.filter(c => c.id !== cat.id));
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Category has been removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete category.'
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

    // Create reordered copy of categories array
    const updatedCategories = [...categories];
    const draggedItemContent = updatedCategories.splice(dragItem.current, 1)[0];
    updatedCategories.splice(dragOverItem.current, 0, draggedItemContent);

    // Update order numbers sequentially (1, 2, 3...)
    const reindexedCategories = updatedCategories.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setCategories(reindexedCategories);

    dragItem.current = null;
    dragOverItem.current = null;

    // Save new order sequence to backend API
    try {
      const res = await api.put('/api/categories/reorder', {
        orderedItems: reindexedCategories
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

  return (
    <div className="space-y-3 font-open-sans">

      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              Category Management
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Drag rows with mouse to reorder display sequence or add new catalog categories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Categories"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* CATEGORIES TABLE WITH DRAG AND DROP */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2 px-2.5 text-center w-10">Reorder</th>
                <th className="py-2 px-3">Image</th>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Heading / Subtitle</th>
                <th className="py-2 px-3 text-center">Order</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-cat-${n}`} className="animate-pulse bg-white">
                    <td className="py-2 px-2.5 text-center">
                      <div className="w-4 h-4 bg-slate-200 mx-auto rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="w-8 h-8 rounded-[4px] bg-slate-200" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-28 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-48 bg-slate-200 rounded-[3px]" />
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
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs font-medium">
                    No data found.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr 
                    key={cat.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`bg-white hover:bg-amber-50/40 transition-colors cursor-move ${
                      isDragging ? 'opacity-80' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <td className="py-2 px-2.5 text-center text-slate-400 hover:text-amber-800">
                      <GripVertical className="w-4 h-4 mx-auto cursor-grab active:cursor-grabbing" title="Drag with mouse to reorder" />
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-2 px-3">
                      {cat.imageUrl ? (
                        <img 
                          src={cat.imageUrl} 
                          alt={cat.title}
                          className="w-8 h-8 rounded-[4px] object-cover border border-slate-200 shadow-2xs" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="py-2 px-3 font-semibold text-slate-900 text-xs">
                      {cat.title}
                    </td>

                    {/* Heading */}
                    <td className="py-2 px-3 text-slate-600 text-[11px] truncate max-w-[220px]">
                      {cat.heading || <span className="text-slate-400 italic">No heading specified</span>}
                    </td>

                    {/* Order */}
                    <td className="py-2 px-3 text-center font-mono font-medium text-slate-800">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-[3px] text-[10px]">
                        {cat.order}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase inline-flex items-center gap-1 ${
                        cat.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {cat.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="Edit Category"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-all"
                          title="Delete Category"
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

      {/* MODAL 1: ADD CATEGORY MODAL */}
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
                ADD NEW CATEGORY
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Creates a new category item with optional image upload to Firebase Storage
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              {/* IMAGE UPLOAD (FIREBASE STORAGE) */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Category Thumbnail Image (Optional - Firebase Storage)
                </label>
                <div className="flex items-center gap-3">
                  {formData.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-[4px] border border-slate-400 overflow-hidden shrink-0 shadow-2xs">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-slate-950 text-white rounded-full hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-[4px] bg-slate-100 border border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-600 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900 text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-amber-800" />
                    <span>{uploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Title <span className="text-rose-600 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rings, Necklaces, Custom Vault"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              {/* HEADING */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Heading / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive Diamond & Gold Rings Collection"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
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
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase disabled:opacity-50 shadow-2xs"
                >
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CATEGORY MODAL */}
      {isEditModalOpen && editingCategory && (
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
                EDIT CATEGORY
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Update details for <span className="text-amber-900 font-semibold">{editingCategory.title}</span>
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              {/* IMAGE UPLOAD (FIREBASE STORAGE) */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Category Thumbnail Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {formData.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-[4px] border border-slate-400 overflow-hidden shrink-0 shadow-2xs">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-slate-950 text-white rounded-full hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-[4px] bg-slate-100 border border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-600 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900 text-xs font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-amber-800" />
                    <span>{uploadingImage ? 'Uploading...' : 'Replace Image File'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

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

              {/* HEADING */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Heading / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
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
                  disabled={submitting || uploadingImage}
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
