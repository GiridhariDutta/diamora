import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  RefreshCw, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Calculator,
  CheckCircle2,
  FileText,
  Eye,
  Gem
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';
import { storage } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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

const DIAMOND_SHAPES = [
  'Round', 'Princess', 'Marquise', 'Oval', 'Pear', 
  'Emerald', 'Cushion', 'Radiant', 'Heart', 'Baguette', 'Triangle', 'Other'
];

const MAX_MEDIA_LIMIT = 10;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [colors, setColors] = useState([]);
  const [purities, setPurities] = useState([]);
  const [diamondQualities, setDiamondQualities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Initial Form State
  const initialFormState = {
    title: '',
    sku: '',
    categoryId: '',
    collectionId: '',
    colorId: '',
    purityId: '',
    netGoldWeightGrams: '',
    
    diamondMode: 'auto', // 'auto' | 'manual'
    diamonds: [
      {
        shape: 'Round',
        diamondQualityId: '',
        totalDiamondCarats: '',
        numberOfDiamonds: '',
        customDiamondPrice: ''
      }
    ],

    makingChargeBase: '',
    makingChargeDiscountPercent: '',
    gstPercent: 3,

    certification: '100% Certified & BIS Hallmarked',
    status: 'Active',
    showInHomepage: false,
    descriptionHtml: '',
    media: [] // Array of { url, type }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const editorRef = useRef(null);

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

  // Fetch Master Data & Products
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, colRes, clrRes, purRes, dqRes] = await Promise.allSettled([
        api.get('/api/products'),
        api.get('/api/categories'),
        api.get('/api/collections'),
        api.get('/api/colors'),
        api.get('/api/purities'),
        api.get('/api/diamond-qualities')
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        setProducts(prodRes.value.data.data);
      }
      if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
        setCategories(catRes.value.data.data.filter(c => c.status === 'Active'));
      }
      if (colRes.status === 'fulfilled' && colRes.value.data?.success) {
        setCollections(colRes.value.data.data.filter(c => c.status === 'Active'));
      }
      if (clrRes.status === 'fulfilled' && clrRes.value.data?.success) {
        setColors(clrRes.value.data.data.filter(c => c.status === 'Active'));
      }
      if (purRes.status === 'fulfilled' && purRes.value.data?.success) {
        setPurities(purRes.value.data.data.filter(p => p.status === 'Active'));
      }
      if (dqRes.status === 'fulfilled' && dqRes.value.data?.success) {
        setDiamondQualities(dqRes.value.data.data.filter(dq => dq.status === 'Active'));
      }
    } catch (err) {
      console.warn('Inventory fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Synchronize ContentEditable canvas with descriptionHtml when modal opens
  useEffect(() => {
    if ((isAddModalOpen || isEditModalOpen) && editorRef.current) {
      editorRef.current.innerHTML = formData.descriptionHtml || '';
    }
  }, [isAddModalOpen, isEditModalOpen]);

  // Dynamic Diamond Component Array Handlers
  const handleAddDiamondRow = () => {
    setFormData(prev => ({
      ...prev,
      diamonds: [
        ...prev.diamonds,
        {
          shape: 'Round',
          diamondQualityId: '',
          totalDiamondCarats: '',
          numberOfDiamonds: '',
          customDiamondPrice: ''
        }
      ]
    }));
  };

  const handleRemoveDiamondRow = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      diamonds: prev.diamonds.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleDiamondChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.diamonds];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return { ...prev, diamonds: updated };
    });
  };

  // Compute Price Breakdown Components Live
  const computePriceBreakdown = () => {
    // 1. Metal Price = Net Gold Weight (g) * Purity Rate (₹/g)
    const selectedPurity = purities.find(p => p.id === formData.purityId);
    const purityRate = selectedPurity ? (Number(selectedPurity.ratePerGram) || 0) : 0;
    const goldWeight = Number(formData.netGoldWeightGrams) || 0;
    const goldPrice = goldWeight * purityRate;

    // 2. Diamond Price Breakdown over all diamond components
    let totalDiamondPrice = 0;
    let totalCaratsSum = 0;
    let totalCountSum = 0;

    const diamondComponents = Array.isArray(formData.diamonds) && formData.diamonds.length > 0
      ? formData.diamonds
      : [{
          shape: 'Round',
          diamondQualityId: formData.diamondQualityId || '',
          totalDiamondCarats: formData.totalDiamondCarats || '',
          numberOfDiamonds: formData.numberOfDiamonds || '',
          customDiamondPrice: formData.customDiamondPrice || ''
        }];

    const processedDiamonds = diamondComponents.map(row => {
      const carats = Number(row.totalDiamondCarats) || 0;
      const count = Number(row.numberOfDiamonds) || 0;
      const selectedDQ = diamondQualities.find(dq => dq.id === row.diamondQualityId);
      const ratePerCarat = selectedDQ ? (Number(selectedDQ.ratePerCarat) || 0) : 0;
      
      let rowPrice = 0;
      if (formData.diamondMode === 'manual') {
        rowPrice = Number(row.customDiamondPrice) || 0;
      } else {
        rowPrice = carats * ratePerCarat;
      }

      totalDiamondPrice += rowPrice;
      totalCaratsSum += carats;
      totalCountSum += count;

      return {
        ...row,
        diamondQualityTitle: selectedDQ ? selectedDQ.title : '',
        diamondRatePerCarat: ratePerCarat,
        rowPrice
      };
    });

    // 3. Making Charges
    const baseMaking = Number(formData.makingChargeBase) || 0;
    const discountPercent = Number(formData.makingChargeDiscountPercent) || 0;
    const discountAmount = (baseMaking * discountPercent) / 100;
    const finalMakingCharges = Math.max(0, baseMaking - discountAmount);

    // 4. Subtotal & GST Tax
    const subtotal = goldPrice + totalDiamondPrice + finalMakingCharges;
    const gstRate = Number(formData.gstPercent) || 3;
    const gstAmount = (subtotal * gstRate) / 100;
    const grandTotal = subtotal + gstAmount;

    return {
      purityRate,
      goldPrice,
      processedDiamonds,
      totalCaratsSum,
      totalCountSum,
      diamondPrice: totalDiamondPrice,
      baseMaking,
      discountAmount,
      finalMakingCharges,
      subtotal,
      gstRate,
      gstAmount,
      grandTotal: Math.round(grandTotal)
    };
  };

  const computedValuation = computePriceBreakdown();

  // Exec command for Rich Text Description Editor
  const handleExecCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setFormData(prev => ({ ...prev, descriptionHtml: editorRef.current.innerHTML }));
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, descriptionHtml: editorRef.current.innerHTML }));
    }
  };

  // Helper to compress base64 images to prevent 413 Payload Too Large
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      if (!file.type || !file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedBase64);
        };
        img.onerror = () => {
          resolve(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Upload Product Media Files (Firebase Storage + Fail-safe Base64 Fallback)
  const handleFileUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    // Reset input value so selecting files repeatedly always triggers onChange
    e.target.value = '';

    const currentMediaCount = formData.media ? formData.media.length : 0;
    if (currentMediaCount + files.length > MAX_MEDIA_LIMIT) {
      lightSwal.fire({
        icon: 'warning',
        title: 'Upload Limit Exceeded',
        text: `You can upload a maximum of ${MAX_MEDIA_LIMIT} images/videos. You already have ${currentMediaCount} uploaded.`
      });
      return;
    }

    setUploadingMedia(true);
    setErrorMessage('');

    try {
      const uploadedMedia = [];

      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        let finalUrl = '';

        // Try Firebase Storage upload first with 6s timeout
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const storageRef = ref(storage, fileName);

          const uploadTask = uploadBytesResumable(storageRef, file);

          finalUrl = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              reject(new Error('Firebase storage upload timed out'));
            }, 6000);

            uploadTask.on(
              'state_changed',
              null,
              (error) => {
                clearTimeout(timer);
                reject(error);
              },
              async () => {
                clearTimeout(timer);
                try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(downloadURL);
                } catch (err) {
                  reject(err);
                }
              }
            );
          });
        } catch (firebaseErr) {
          console.warn('Firebase Storage upload notice (using local compressed fallback):', firebaseErr.message);
          // Fallback to compressed Base64 Data URL to avoid HTTP 413 Payload Too Large
          finalUrl = await compressImageFile(file);
        }

        if (finalUrl) {
          uploadedMedia.push({
            url: finalUrl,
            type: isVideo ? 'video' : 'image'
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        media: [...(prev.media || []), ...uploadedMedia]
      }));

      lightSwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${uploadedMedia.length} Media File(s) Added!`,
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      setErrorMessage('Media upload failed. Please try selecting a smaller file.');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Remove Media Item
  const handleRemoveMedia = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Open View Details Modal Card
  const handleOpenViewModal = (prod) => {
    setViewingProduct(prod);
    setActiveMediaIndex(0);
    setIsViewModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      ...initialFormState,
      sku: `DM-${Math.floor(100000 + Math.random() * 900000)}`
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  // Submit Add Product
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const val = computePriceBreakdown();

    const selectedCat = categories.find(c => c.id === formData.categoryId);
    const selectedCol = collections.find(c => c.id === formData.collectionId);
    const selectedClr = colors.find(c => c.id === formData.colorId);
    const selectedPur = purities.find(p => p.id === formData.purityId);

    const payload = {
      ...formData,
      diamonds: val.processedDiamonds,
      diamondQualityTitle: val.processedDiamonds[0]?.diamondQualityTitle || '',
      diamondRatePerCarat: val.processedDiamonds[0]?.diamondRatePerCarat || 0,
      totalDiamondCarats: val.totalCaratsSum,
      numberOfDiamonds: val.totalCountSum,

      categoryTitle: selectedCat ? selectedCat.title : '',
      collectionTitle: selectedCol ? selectedCol.title : '',
      colorTitle: selectedClr ? selectedClr.title : '',
      purityTitle: selectedPur ? selectedPur.title : '',
      purityRatePerGram: val.purityRate,

      computedGoldPrice: val.goldPrice,
      computedDiamondPrice: val.diamondPrice,
      computedMakingCharges: val.finalMakingCharges,
      computedGst: val.gstAmount,
      grandTotal: val.grandTotal
    };

    try {
      const res = await api.post('/api/products', payload);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        fetchAllData();

        lightSwal.fire({
          icon: 'success',
          title: 'Product Published!',
          text: `"${formData.title}" added to inventory successfully.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);

    let existingDiamonds = [];
    if (Array.isArray(prod.diamonds) && prod.diamonds.length > 0) {
      existingDiamonds = prod.diamonds;
    } else {
      existingDiamonds = [{
        shape: 'Round',
        diamondQualityId: prod.diamondQualityId || '',
        totalDiamondCarats: prod.totalDiamondCarats !== undefined ? prod.totalDiamondCarats : '',
        numberOfDiamonds: prod.numberOfDiamonds !== undefined ? prod.numberOfDiamonds : '',
        customDiamondPrice: prod.customDiamondPrice !== undefined ? prod.customDiamondPrice : ''
      }];
    }

    setFormData({
      title: prod.title || '',
      sku: prod.sku || '',
      categoryId: prod.categoryId || '',
      collectionId: prod.collectionId || '',
      colorId: prod.colorId || '',
      purityId: prod.purityId || '',
      netGoldWeightGrams: prod.netGoldWeightGrams !== undefined ? prod.netGoldWeightGrams : '',
      
      diamondMode: prod.diamondMode || 'auto',
      diamonds: existingDiamonds,

      makingChargeBase: prod.makingChargeBase !== undefined ? prod.makingChargeBase : '',
      makingChargeDiscountPercent: prod.makingChargeDiscountPercent !== undefined ? prod.makingChargeDiscountPercent : '',
      gstPercent: prod.gstPercent || 3,

      certification: prod.certification || '100% Certified & BIS Hallmarked',
      status: prod.status || 'Active',
      showInHomepage: Boolean(prod.showInHomepage),
      descriptionHtml: prod.descriptionHtml || '',
      media: Array.isArray(prod.media) ? prod.media : []
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  // Submit Edit Product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    setErrorMessage('');

    const val = computePriceBreakdown();

    const selectedCat = categories.find(c => c.id === formData.categoryId);
    const selectedCol = collections.find(c => c.id === formData.collectionId);
    const selectedClr = colors.find(c => c.id === formData.colorId);
    const selectedPur = purities.find(p => p.id === formData.purityId);

    const payload = {
      ...formData,
      diamonds: val.processedDiamonds,
      diamondQualityTitle: val.processedDiamonds[0]?.diamondQualityTitle || '',
      diamondRatePerCarat: val.processedDiamonds[0]?.diamondRatePerCarat || 0,
      totalDiamondCarats: val.totalCaratsSum,
      numberOfDiamonds: val.totalCountSum,

      categoryTitle: selectedCat ? selectedCat.title : '',
      collectionTitle: selectedCol ? selectedCol.title : '',
      colorTitle: selectedClr ? selectedClr.title : '',
      purityTitle: selectedPur ? selectedPur.title : '',
      purityRatePerGram: val.purityRate,

      computedGoldPrice: val.goldPrice,
      computedDiamondPrice: val.diamondPrice,
      computedMakingCharges: val.finalMakingCharges,
      computedGst: val.gstAmount,
      grandTotal: val.grandTotal
    };

    try {
      const res = await api.put(`/api/products/${editingProduct.id}`, payload);
      if (res.data?.success) {
        setIsEditModalOpen(false);
        setEditingProduct(null);
        fetchAllData();

        lightSwal.fire({
          icon: 'success',
          title: 'Product Updated!',
          text: `"${formData.title}" updated successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = (prod) => {
    lightSwal.fire({
      title: 'Delete Product?',
      text: `Are you sure you want to remove "${prod.title}" (${prod.sku})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/api/products/${prod.id}`);
          if (res.data?.success) {
            setProducts(prev => prev.filter(p => p.id !== prod.id));
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Product removed from catalog.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete product.'
          });
        }
      }
    });
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-3 font-open-sans">

      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-700" />
              Inventory & Diamond Jewellery Catalog
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage product pricing dynamically connected to Gold Purities & Diamond Quality rates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh Products"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product title or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-2xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* PRODUCTS CATALOG TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2 px-3">Product Info</th>
                <th className="py-2 px-3">Category / Metal</th>
                <th className="py-2 px-3 text-right">Gold Weight</th>
                <th className="py-2 px-3 text-right">Diamond Specs</th>
                <th className="py-2 px-3 text-right">Grand Total (₹)</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={`skel-prod-${n}`} className="animate-pulse bg-white">
                    <td className="py-2.5 px-3">
                      <div className="h-3 w-32 bg-slate-200 rounded-[3px] mb-1" />
                      <div className="h-2.5 w-16 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="h-3 w-20 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="h-3 w-16 bg-slate-200 ml-auto rounded-[3px]" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="h-3 w-24 bg-slate-200 ml-auto rounded-[3px]" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="h-3 w-20 bg-slate-200 ml-auto rounded-[3px]" />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="h-4 w-16 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs font-medium">
                    No products found. Click "Add Product" to create your first diamond jewellery catalog item.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="bg-white hover:bg-amber-50/40 transition-colors">
                    
                    {/* Product Info */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-slate-900 rounded-[4px] overflow-hidden border border-slate-300 shrink-0 flex items-center justify-center">
                          {p.media && p.media.length > 0 ? (
                            p.media[0].type === 'video' ? (
                              <Video className="w-4 h-4 text-amber-400" />
                            ) : (
                              <img src={p.media[0].url} alt={p.title} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 text-xs block leading-snug">
                            {p.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {p.sku}
                            </span>
                            {p.showInHomepage && (
                              <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-100 text-amber-900 text-[8.5px] font-semibold uppercase tracking-wider border border-amber-300">
                                Homepage
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Metal */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 text-[11px] block">
                        {p.categoryTitle || 'N/A'}
                      </span>
                      <span className="text-[10px] text-amber-900 font-medium block">
                        {p.purityTitle || 'N/A'} {p.colorTitle ? `(${p.colorTitle})` : ''}
                      </span>
                    </td>

                    {/* Gold Weight */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 text-xs">
                      {p.netGoldWeightGrams ? `${p.netGoldWeightGrams} g` : '0 g'}
                    </td>

                    {/* Diamond Specs */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono font-semibold text-slate-900 text-xs block">
                        {p.totalDiamondCarats ? `${p.totalDiamondCarats} Ct` : '0 Ct'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {Array.isArray(p.diamonds) && p.diamonds.length > 1
                          ? `${p.diamonds.length} Shapes (${p.numberOfDiamonds || 0} Pcs)`
                          : `${p.diamondQualityTitle || 'Standard'} (${p.numberOfDiamonds || 0} Pcs)`
                        }
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-950 text-xs">
                      ₹{Number(p.grandTotal || p.computedGoldPrice || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase inline-flex items-center gap-1 ${
                        p.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {p.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions: VIEW, EDIT, DELETE */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* View Details Icon */}
                        <button
                          onClick={() => handleOpenViewModal(p)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="View Product Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Icon */}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="Edit Product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Icon */}
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-all"
                          title="Delete Product"
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

      {/* MODAL 1 & 2: ADD / EDIT PRODUCT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white border border-slate-300 rounded-[4px] shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* FIXED STICKY CARD HEADER */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  {isEditModalOpen ? 'EDIT DIAMOND PRODUCT' : 'ADD NEW DIAMOND PRODUCT'}
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Fill metal weight, diamond carats, upload media, and review the live dynamic price breakdown.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-950 rounded-[4px] transition-colors shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE CARD BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-[4px] p-3.5 space-y-3">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                  1. Basic Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Product Title <span className="text-rose-600 font-semibold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elora Diamond Pendant"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      SKU / Product Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DM-8821"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Category <span className="text-rose-600 font-semibold">*</span>
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Collection
                    </label>
                    <select
                      value={formData.collectionId}
                      onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    >
                      <option value="">Select Collection (Optional)</option>
                      {collections.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STATUS & SHOW IN HOMEPAGE TOGGLE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 border border-slate-300 rounded-[4px] w-full hover:border-amber-500 transition-colors shadow-2xs">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.showInHomepage)}
                        onChange={(e) => setFormData({ ...formData, showInHomepage: e.target.checked })}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 accent-amber-600 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800 tracking-wide">
                        Show in Homepage
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: METAL & GOLD SPECIFICATIONS */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-[4px] p-3.5 space-y-3">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                  2. Metal & Gold Specifications
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Metal Color
                    </label>
                    <select
                      value={formData.colorId}
                      onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    >
                      <option value="">Select Color</option>
                      {colors.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Gold Purity <span className="text-rose-600 font-semibold">*</span>
                    </label>
                    <select
                      required
                      value={formData.purityId}
                      onChange={(e) => setFormData({ ...formData, purityId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    >
                      <option value="">Select Purity</option>
                      {purities.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} {p.ratePerGram ? `(₹${Number(p.ratePerGram).toLocaleString('en-IN')}/g)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Net Gold Weight (Grams) <span className="text-rose-600 font-semibold">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      required
                      placeholder="e.g. 5.978"
                      value={formData.netGoldWeightGrams}
                      onChange={(e) => setFormData({ ...formData, netGoldWeightGrams: limitDecimalPlaces(e.target.value, 3) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DIAMOND SPECIFICATIONS (MULTIPLE DIAMOND SHAPES SUPPORT) */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-[4px] p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-amber-700" />
                    3. Diamond Specifications
                  </span>

                  {/* Diamond Pricing Mode Toggle */}
                  <div className="flex items-center gap-1.5 bg-slate-200/80 p-0.5 rounded-[3px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, diamondMode: 'auto' })}
                      className={`px-2.5 py-0.5 text-[9.5px] font-semibold tracking-wider uppercase rounded-[3px] transition-all ${
                        formData.diamondMode === 'auto'
                          ? 'bg-white text-amber-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Auto Grade Rate
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, diamondMode: 'manual' })}
                      className={`px-2.5 py-0.5 text-[9.5px] font-semibold tracking-wider uppercase rounded-[3px] transition-all ${
                        formData.diamondMode === 'manual'
                          ? 'bg-white text-amber-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Manual Price
                    </button>
                  </div>
                </div>

                {/* DYNAMIC DIAMOND ROWS */}
                <div className="space-y-2.5">
                  {formData.diamonds.map((dRow, index) => (
                    <div key={`drow-${index}`} className="p-2.5 bg-white border border-slate-200 rounded-[4px] relative shadow-2xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider">
                          Diamond Component #{index + 1}
                        </span>

                        {formData.diamonds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDiamondRow(index)}
                            className="text-rose-600 hover:text-rose-800 p-0.5 text-xs flex items-center gap-1 font-semibold transition-colors"
                            title="Remove this diamond component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[9.5px] uppercase">Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {/* Shape */}
                        <div>
                          <label className="block text-[10.5px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                            Shape / Cut
                          </label>
                          <select
                            value={dRow.shape || 'Round'}
                            onChange={(e) => handleDiamondChange(index, 'shape', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs"
                          >
                            {DIAMOND_SHAPES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Quality */}
                        <div>
                          <label className="block text-[10.5px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                            Diamond Quality
                          </label>
                          <select
                            value={dRow.diamondQualityId}
                            onChange={(e) => handleDiamondChange(index, 'diamondQualityId', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs"
                          >
                            <option value="">Select Quality</option>
                            {diamondQualities.map(dq => (
                              <option key={dq.id} value={dq.id}>
                                {dq.title} {dq.ratePerCarat ? `(₹${Number(dq.ratePerCarat).toLocaleString('en-IN')}/Ct)` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Total Carats */}
                        <div>
                          <label className="block text-[10.5px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                            Weight (Carats / Ct)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="e.g. 0.290"
                            value={dRow.totalDiamondCarats}
                            onChange={(e) => handleDiamondChange(index, 'totalDiamondCarats', limitDecimalPlaces(e.target.value, 3))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs"
                          />
                        </div>

                        {/* Number of Diamonds */}
                        <div>
                          <label className="block text-[10.5px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                            Number of Diamonds
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 31"
                            value={dRow.numberOfDiamonds}
                            onChange={(e) => handleDiamondChange(index, 'numberOfDiamonds', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs"
                          />
                        </div>

                        {/* Custom Price if manual */}
                        {formData.diamondMode === 'manual' && (
                          <div className="sm:col-span-4">
                            <label className="block text-[10.5px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                              Custom Diamond Component Price (₹)
                            </label>
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              placeholder="e.g. 26840.000"
                              value={dRow.customDiamondPrice}
                              onChange={(e) => handleDiamondChange(index, 'customDiamondPrice', limitDecimalPlaces(e.target.value, 3))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Diamond Button */}
                <button
                  type="button"
                  onClick={handleAddDiamondRow}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-dashed border-amber-600/70 text-amber-900 font-semibold text-xs rounded-[4px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Add Another Diamond Component</span>
                </button>
              </div>

              {/* SECTION 4: MAKING CHARGES & TAXES */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-[4px] p-3.5 space-y-3">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                  4. Making Charges & Taxes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Base Making Charge (₹)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="e.g. 12000"
                      value={formData.makingChargeBase}
                      onChange={(e) => setFormData({ ...formData, makingChargeBase: limitDecimalPlaces(e.target.value, 3) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      Making Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 20"
                      value={formData.makingChargeDiscountPercent}
                      onChange={(e) => setFormData({ ...formData, makingChargeDiscountPercent: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-slate-700 uppercase mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.gstPercent}
                      onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: DYNAMIC VALUATION SUMMARY CARD */}
              <div className="bg-amber-50/70 border border-amber-300/80 rounded-[4px] p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200/90 pb-1.5">
                  <span className="text-xs font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    Live Price Calculation Breakdown
                  </span>
                  <span className="text-[10px] font-semibold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-[3px]">
                    Auto Computed
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-[3px] border border-amber-200/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Metal Value</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{computedValuation.goldPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-[3px] border border-amber-200/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Diamond Value</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{computedValuation.diamondPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-[3px] border border-amber-200/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Net Making Charge</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{computedValuation.finalMakingCharges.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-[3px] border border-amber-200/60">
                    <span className="text-[10px] text-slate-500 uppercase block">GST Tax ({computedValuation.gstRate}%)</span>
                    <span className="font-mono font-semibold text-amber-900">
                      ₹{computedValuation.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200/80 rounded-[3px] border border-amber-300">
                    <span className="text-[10px] text-amber-900 uppercase font-semibold block">Grand Total (Inc GST)</span>
                    <span className="font-mono font-semibold text-amber-950 text-sm">
                      ₹{computedValuation.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 6: PRODUCT MEDIA UPLOAD (MAX 10 FILES WITH BELOW THUMBNAILS & DELETE BUTTON) */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-[4px] p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    Product Images & Videos
                  </span>
                  <span className="text-[10.5px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-[3px]">
                    {formData.media ? formData.media.length : 0} / {MAX_MEDIA_LIMIT} Uploaded
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className={`flex-1 w-full flex items-center justify-center gap-2 p-3 bg-white border border-dashed rounded-[4px] transition-colors shadow-2xs ${
                    formData.media.length >= MAX_MEDIA_LIMIT
                      ? 'border-slate-300 opacity-60 cursor-not-allowed'
                      : 'border-slate-400 hover:border-amber-600 cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-semibold text-slate-800 uppercase">
                      {uploadingMedia 
                        ? 'Uploading to Firebase...' 
                        : (formData.media.length >= MAX_MEDIA_LIMIT ? 'Maximum 10 Files Reached' : 'Choose Photos / Videos')}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadingMedia || formData.media.length >= MAX_MEDIA_LIMIT}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Media Thumbnails Grid directly below upload button with Delete action */}
                {formData.media && formData.media.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Uploaded Photos & Videos ({formData.media.length}/{MAX_MEDIA_LIMIT})
                    </span>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {formData.media.map((item, idx) => (
                        <div key={`media-${idx}`} className="relative group aspect-square bg-slate-950 rounded-[4px] overflow-hidden border border-slate-300 shadow-2xs">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-400 p-1">
                              <Video className="w-5 h-5 mb-1" />
                              <span className="text-[8.5px] uppercase font-semibold text-slate-300">Video</span>
                            </div>
                          ) : (
                            <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                          )}

                          {/* Delete Media Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-all opacity-90 hover:opacity-100"
                            title="Delete this media file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 7: PRODUCT DESCRIPTION (RICH TEXT CKEDITOR CANVAS) */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-[4px] p-3 space-y-2">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  Product Description Editor
                </span>

                <div className="border border-slate-300 rounded-[4px] bg-white overflow-hidden shadow-2xs">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-100 border-b border-slate-300">
                    <button type="button" onClick={() => handleExecCommand('bold')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExecCommand('italic')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExecCommand('underline')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-slate-300 mx-0.5" />
                    <button type="button" onClick={() => handleExecCommand('formatBlock', 'h1')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="H1"><Heading1 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExecCommand('formatBlock', 'h2')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="H2"><Heading2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExecCommand('formatBlock', 'h3')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="H3"><Heading3 className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-slate-300 mx-0.5" />
                    <button type="button" onClick={() => handleExecCommand('insertUnorderedList')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="Bullets"><List className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExecCommand('insertOrderedList')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="Numbers"><ListOrdered className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExecCommand('formatBlock', 'blockquote')} className="p-1 bg-white border border-slate-300 rounded-[3px]" title="Quote"><Quote className="w-3.5 h-3.5" /></button>
                  </div>

                  {/* Canvas */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    className="min-h-[140px] max-h-[220px] p-3 text-xs leading-relaxed text-slate-900 focus:outline-none overflow-y-auto space-y-1.5 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-[4px] text-xs text-slate-900 uppercase tracking-wider font-semibold shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase disabled:opacity-50 shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Saving...' : (isEditModalOpen ? 'Save Product Changes' : 'Publish Product')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    )}

      {/* MODAL 3: VIEW PRODUCT DETAILS MODAL CARD */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-slate-300 rounded-[4px] shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* FIXED STICKY CARD HEADER */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-open-sans text-base sm:text-lg font-semibold text-slate-950 uppercase tracking-wide">
                    {viewingProduct.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-semibold uppercase ${
                    viewingProduct.status === 'Active' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {viewingProduct.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>SKU: <strong className="text-slate-800 font-semibold">{viewingProduct.sku}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-800 font-semibold">{viewingProduct.categoryTitle || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Collection: <strong className="text-slate-800 font-semibold">{viewingProduct.collectionTitle || 'N/A'}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-amber-100/80 border border-amber-300 px-3 py-1.5 rounded-[4px] text-right">
                  <span className="text-[10px] text-amber-900 font-semibold uppercase block">Grand Total Price</span>
                  <span className="text-lg font-mono font-semibold text-amber-950">
                    ₹{Number(viewingProduct.grandTotal || viewingProduct.computedGoldPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsViewModalOpen(false); setViewingProduct(null); }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-950 rounded-[4px] transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE CARD BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* MEDIA GALLERY CAROUSEL (5 COLS) */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-square bg-slate-950 rounded-[4px] overflow-hidden border border-slate-300 flex items-center justify-center relative shadow-2xs">
                  {viewingProduct.media && viewingProduct.media.length > 0 ? (
                    viewingProduct.media[activeMediaIndex]?.type === 'video' ? (
                      <video src={viewingProduct.media[activeMediaIndex]?.url} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={viewingProduct.media[activeMediaIndex]?.url} alt={viewingProduct.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="text-center text-slate-500 p-4">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-400 mb-1" />
                      <span className="text-xs uppercase font-medium">No Media Uploaded</span>
                    </div>
                  )}
                </div>

                {/* THUMBNAIL STRIP */}
                {viewingProduct.media && viewingProduct.media.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingProduct.media.map((item, idx) => (
                      <button
                        key={`vthumb-${idx}`}
                        type="button"
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`w-12 h-12 rounded-[4px] overflow-hidden border shrink-0 transition-all ${
                          activeMediaIndex === idx ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-slate-900 text-amber-400 flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                        ) : (
                          <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* CERTIFICATION CARD */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-center">
                  <span className="text-[11px] font-semibold text-slate-800 uppercase flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {viewingProduct.certification || 'BIS Hallmarked & Certified'}
                  </span>
                </div>
              </div>

              {/* SPECIFICATIONS & VALUATION DETAILS (7 COLS) */}
              <div className="md:col-span-7 space-y-4">
                
                {/* 1. GOLD SPECIFICATIONS CARD */}
                <div className="bg-slate-50/90 border border-slate-200 rounded-[4px] p-3 space-y-2">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                    1. Gold & Metal Specifications
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2 border border-slate-200 rounded-[3px]">
                      <span className="text-[10px] text-slate-500 uppercase block">Metal Color</span>
                      <span className="font-semibold text-slate-900">{viewingProduct.colorTitle || 'N/A'}</span>
                    </div>
                    <div className="bg-white p-2 border border-slate-200 rounded-[3px]">
                      <span className="text-[10px] text-slate-500 uppercase block">Purity & Rate</span>
                      <span className="font-semibold text-slate-900">
                        {viewingProduct.purityTitle || 'N/A'} 
                        <small className="text-slate-500 font-mono block">₹{Number(viewingProduct.purityRatePerGram || 0).toLocaleString('en-IN')}/g</small>
                      </span>
                    </div>
                    <div className="bg-white p-2 border border-slate-200 rounded-[3px]">
                      <span className="text-[10px] text-slate-500 uppercase block">Net Weight</span>
                      <span className="font-mono font-semibold text-slate-900">{viewingProduct.netGoldWeightGrams || 0} Grams</span>
                    </div>
                  </div>
                </div>

                {/* 2. DIAMOND SPECIFICATIONS CARD */}
                <div className="bg-slate-50/90 border border-slate-200 rounded-[4px] p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      2. Diamond Specifications
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-[3px]">
                      Mode: {viewingProduct.diamondMode === 'manual' ? 'Manual Price' : 'Auto Grade Rate'}
                    </span>
                  </div>

                  {/* DIAMOND COMPONENTS TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[9.5px] font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-100">
                          <th className="py-1.5 px-2">Shape</th>
                          <th className="py-1.5 px-2">Quality</th>
                          <th className="py-1.5 px-2 text-right">Carats</th>
                          <th className="py-1.5 px-2 text-center">Count</th>
                          <th className="py-1.5 px-2 text-right">Rate / Ct</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Array.isArray(viewingProduct.diamonds) && viewingProduct.diamonds.length > 0 ? (
                          viewingProduct.diamonds.map((d, idx) => (
                            <tr key={`vdiag-${idx}`} className="bg-white">
                              <td className="py-1.5 px-2 font-semibold text-slate-900">{d.shape || 'Round'}</td>
                              <td className="py-1.5 px-2 text-slate-700">{d.diamondQualityTitle || viewingProduct.diamondQualityTitle || 'Standard'}</td>
                              <td className="py-1.5 px-2 text-right font-mono">{d.totalDiamondCarats || 0} Ct</td>
                              <td className="py-1.5 px-2 text-center font-mono">{d.numberOfDiamonds || 0} Pcs</td>
                              <td className="py-1.5 px-2 text-right font-mono text-amber-900 font-semibold">
                                ₹{Number(d.diamondRatePerCarat || viewingProduct.diamondRatePerCarat || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white">
                            <td className="py-1.5 px-2 font-semibold text-slate-900">Standard</td>
                            <td className="py-1.5 px-2 text-slate-700">{viewingProduct.diamondQualityTitle || 'N/A'}</td>
                            <td className="py-1.5 px-2 text-right font-mono">{viewingProduct.totalDiamondCarats || 0} Ct</td>
                            <td className="py-1.5 px-2 text-center font-mono">{viewingProduct.numberOfDiamonds || 0} Pcs</td>
                            <td className="py-1.5 px-2 text-right font-mono text-amber-900 font-semibold">
                              ₹{Number(viewingProduct.diamondRatePerCarat || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. DYNAMIC VALUATION BREAKDOWN CARD */}
                <div className="bg-amber-50/80 border border-amber-300 rounded-[4px] p-3 space-y-2">
                  <span className="text-xs font-semibold text-amber-950 uppercase tracking-wider block border-b border-amber-200 pb-1">
                    3. Dynamic Price Breakdown
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-[3px] border border-amber-200">
                      <span className="text-[9.5px] text-slate-500 uppercase block">Metal Value</span>
                      <span className="font-mono font-semibold text-slate-900">₹{Number(viewingProduct.computedGoldPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-white rounded-[3px] border border-amber-200">
                      <span className="text-[9.5px] text-slate-500 uppercase block">Diamond Value</span>
                      <span className="font-mono font-semibold text-slate-900">₹{Number(viewingProduct.computedDiamondPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-white rounded-[3px] border border-amber-200">
                      <span className="text-[9.5px] text-slate-500 uppercase block">Making Charges</span>
                      <span className="font-mono font-semibold text-slate-900">₹{Number(viewingProduct.computedMakingCharges || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-white rounded-[3px] border border-amber-200">
                      <span className="text-[9.5px] text-slate-500 uppercase block">GST Tax ({viewingProduct.gstPercent || 3}%)</span>
                      <span className="font-mono font-semibold text-amber-900">₹{Number(viewingProduct.computedGst || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-[3px] border border-amber-300">
                      <span className="text-[9.5px] text-amber-900 uppercase font-semibold block">Grand Total</span>
                      <span className="font-mono font-semibold text-amber-950">₹{Number(viewingProduct.grandTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {viewingProduct.descriptionHtml && (
                  <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-3 space-y-1">
                    <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Description
                    </span>
                    <div 
                      className="text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                      dangerouslySetInnerHTML={{ __html: viewingProduct.descriptionHtml }}
                    />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}

// Verified syntax clean with Vite OXC transformer
