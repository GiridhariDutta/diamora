import { db } from '../config/firebase.js';

const formatCertification = (cert) => {
  if (!cert || typeof cert !== 'string') return '100% Certified';
  const cleaned = cert
    .replace(/&\s*BIS\s*Hallmarked/gi, '')
    .replace(/BIS\s*Hallmarked\s*&?/gi, '')
    .trim();
  return cleaned || '100% Certified';
};

// --- In-Memory Rate Cache ---
let rateCache = {
  purities: {},
  diamondQualities: {},
  stones: {},
  lastFetched: 0
};
const CACHE_TTL = 60 * 1000; // 1 minute

async function getLiveRates() {
  const now = Date.now();
  if (now - rateCache.lastFetched < CACHE_TTL) {
    return rateCache;
  }
  if (!db) return rateCache;

  const [puritiesSnap, diamondSnap, stonesSnap] = await Promise.all([
    db.collection('purities').get(),
    db.collection('diamondQualities').get(),
    db.collection('stones').get()
  ]);

  const purities = {};
  puritiesSnap.forEach(doc => { purities[doc.id] = doc.data().ratePerGram || 0; });

  const diamondQualities = {};
  diamondSnap.forEach(doc => { diamondQualities[doc.id] = doc.data().ratePerCarat || 0; });

  const stones = {};
  stonesSnap.forEach(doc => { stones[doc.id] = doc.data().ratePerCarat || 0; });

  rateCache = { purities, diamondQualities, stones, lastFetched: now };
  return rateCache;
}

// --- Dynamic Price Calculator ---
function calculateDynamicPrice(product, rates) {
  // 1. Gold Price
  const goldRate = rates.purities[product.purityId] || 0;
  const computedGoldPrice = (product.netGoldWeightGrams || 0) * goldRate;

  // 2. Diamond Price
  let computedDiamondPrice = 0;
  let processedDiamonds = [];
  if (Array.isArray(product.diamonds)) {
    product.diamonds.forEach(d => {
      const dRate = rates.diamondQualities[d.diamondQualityId] || 0;
      const carats = Number(d.totalDiamondCarats) || 0;
      let rowPrice = 0;
      if (product.diamondMode === 'manual' && Number(d.customDiamondPrice) > 0) {
        rowPrice = Number(d.customDiamondPrice);
      } else {
        rowPrice = carats * dRate;
      }
      computedDiamondPrice += rowPrice;
      processedDiamonds.push({
        ...d,
        diamondRatePerCarat: dRate,
        rowPrice
      });
    });
  }

  // 3. Gemstone Price
  let computedStonePrice = 0;
  let processedStones = [];
  if (product.hasGemstone && Array.isArray(product.stones)) {
    product.stones.forEach(s => {
      const sRate = rates.stones[s.stoneId] || 0;
      const carats = Number(s.stoneWeightCarats) || 0;
      let rowPrice = carats * sRate;
      if (Number(s.customStonePrice) > 0) {
         rowPrice = Number(s.customStonePrice);
      }
      computedStonePrice += rowPrice;
      processedStones.push({
        ...s,
        stoneRatePerCarat: sRate,
        rowPrice
      });
    });
  }

  // 4. Making Charges
  const baseMaking = Number(product.makingChargeBase) || 0;
  const discountPercent = Number(product.makingChargeDiscountPercent) || 0;
  const discountAmount = (baseMaking * discountPercent) / 100;
  const computedMakingCharges = Math.max(0, baseMaking - discountAmount);

  // 5. Subtotal & GST
  const subtotal = computedGoldPrice + computedDiamondPrice + computedStonePrice + computedMakingCharges;
  const gstPercent = Number(product.gstPercent) || 3;
  const computedGst = (subtotal * gstPercent) / 100;
  const grandTotal = Math.round(subtotal + computedGst);

  return {
    ...product,
    purityRatePerGram: goldRate,
    computedGoldPrice,
    computedDiamondPrice,
    computedStonePrice,
    computedMakingCharges,
    computedGst,
    grandTotal,
    diamonds: processedDiamonds,
    stones: processedStones
  };
}

export class ProductService {
  /**
   * Fetch products with optional search, category, collection, color, purity, price, and pagination
   */
  static async getAllProducts(options = {}) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const { page, limit, search, category, collection, color, diamondColor, purity, price, showInCarousel, showInHomepage } = options;

    const snapshot = await db.collection('products').get();
    let rawProducts = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      rawProducts.push({
        id: doc.id,
        ...data,
        certification: formatCertification(data.certification)
      });
    });

    // 1. Sort by createdAt descending
    rawProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Fetch Live Rates and compute prices dynamically
    const liveRates = await getLiveRates();
    let products = rawProducts.map(p => calculateDynamicPrice(p, liveRates));

    // 1b. Filter by showInCarousel if provided
    if (showInCarousel !== undefined && showInCarousel !== '') {
      const isCarouselBool = showInCarousel === 'true' || showInCarousel === true;
      products = products.filter(p => Boolean(p.showInCarousel || p.isCarousel) === isCarouselBool);
    }

    // 1c. Filter by showInHomepage if provided
    if (showInHomepage !== undefined && showInHomepage !== '') {
      const isHomepageBool = showInHomepage === 'true' || showInHomepage === true;
      products = products.filter(p => Boolean(p.showInHomepage || p.isHomepage) === isHomepageBool);
    }

    // 2. Filter by search query if provided
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.categoryTitle && p.categoryTitle.toLowerCase().includes(q)) ||
        (p.collectionTitle && p.collectionTitle.toLowerCase().includes(q))
      );
    }

    // 3. Filter by category if provided
    if (category && typeof category === 'string' && category.trim() !== '') {
      const catQuery = category.trim().toLowerCase();
      products = products.filter(p => 
        (p.categoryId && p.categoryId.toLowerCase() === catQuery) ||
        (p.categoryTitle && p.categoryTitle.toLowerCase().includes(catQuery)) ||
        (p.title && p.title.toLowerCase().includes(catQuery))
      );
    }

    // 4. Filter by collection if provided
    if (collection && typeof collection === 'string' && collection.trim() !== '') {
      const colQuery = collection.trim().toLowerCase();
      products = products.filter(p => 
        (p.collectionId && p.collectionId.toLowerCase() === colQuery) ||
        (p.collectionTitle && p.collectionTitle.toLowerCase().includes(colQuery))
      );
    }

    // 5. Filter by gold color if provided
    if (color && typeof color === 'string' && color.trim() !== '') {
      const colorQuery = color.trim().toLowerCase();
      products = products.filter(p => 
        (p.colorId && p.colorId.toLowerCase() === colorQuery) ||
        (p.colorTitle && p.colorTitle.toLowerCase().includes(colorQuery)) ||
        (p.colors && Array.isArray(p.colors) && p.colors.some(c => 
          (c.colorId && c.colorId.toLowerCase() === colorQuery) || 
          (c.colorTitle && c.colorTitle.toLowerCase().includes(colorQuery))
        ))
      );
    }

    // 5b. Filter by diamond color if provided
    if (diamondColor && typeof diamondColor === 'string' && diamondColor.trim() !== '') {
      const dColorQuery = diamondColor.trim().toLowerCase();
      products = products.filter(p => 
        (p.diamondColorId && p.diamondColorId.toLowerCase() === dColorQuery) ||
        (p.diamondColorTitle && p.diamondColorTitle.toLowerCase().includes(dColorQuery)) ||
        (p.diamonds && Array.isArray(p.diamonds) && p.diamonds.some(d => d.color && d.color.toLowerCase().includes(dColorQuery)))
      );
    }

    // 6. Filter by purity if provided
    if (purity && typeof purity === 'string' && purity.trim() !== '') {
      const purityQuery = purity.trim().toLowerCase();
      products = products.filter(p => 
        (p.purityId && p.purityId.toLowerCase() === purityQuery) ||
        (p.purityTitle && p.purityTitle.toLowerCase().includes(purityQuery))
      );
    }

    // 7. Filter by price range if provided (NOW USING DYNAMIC grandTotal)
    if (price && typeof price === 'string' && price.trim() !== '') {
      const priceKey = price.trim().toLowerCase();
      products = products.filter(p => {
        const itemPrice = Number(p.grandTotal || 0);
        if (priceKey === 'under-50k') return itemPrice < 50000;
        if (priceKey === '50k-75k') return itemPrice >= 50000 && itemPrice <= 75000;
        if (priceKey === '75k-100k') return itemPrice > 75000 && itemPrice <= 100000;
        if (priceKey === 'above-100k') return itemPrice > 100000;
        return true;
      });
    }

    const totalItems = products.length;

    // 8. Pagination (if page or limit parameters exist)
    if (page !== undefined || limit !== undefined) {
      const limitNum = parseInt(limit, 10) || 12;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

      return {
        products: paginatedProducts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    }

    // Default return if no pagination params provided
    return {
      products,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems,
        limit: totalItems,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  /**
   * Get single product by ID
   */
  static async getProductById(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Product not found');
    }

    const data = {
      id: docSnap.id,
      ...docSnap.data(),
      certification: formatCertification(docSnap.data().certification)
    };

    // Calculate dynamic price
    const liveRates = await getLiveRates();
    return calculateDynamicPrice(data, liveRates);
  }

  /**
   * Create a new product (ONLY saves structural data, no computed prices)
   */
  static async createProduct(data) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!data.title || !data.title.trim()) {
      throw new Error('Product title is required.');
    }

    // Clean up diamonds and stones arrays to strip any computed frontend values if present
    const cleanDiamonds = Array.isArray(data.diamonds) ? data.diamonds.map(d => ({
      shape: d.shape || 'Round',
      settingType: d.settingType || '',
      diamondQualityId: d.diamondQualityId || '',
      totalDiamondCarats: Number(d.totalDiamondCarats) || 0,
      numberOfDiamonds: Number(d.numberOfDiamonds) || 0,
      customDiamondPrice: Number(d.customDiamondPrice) || 0,
      diamondQualityTitle: d.diamondQualityTitle || ''
    })) : [];

    const cleanStones = Array.isArray(data.stones) ? data.stones.map(s => ({
      stoneId: s.stoneId || '',
      settingType: s.settingType || '',
      stoneWeightCarats: Number(s.stoneWeightCarats) || 0,
      numberOfStones: Number(s.numberOfStones) || 0,
      customStonePrice: Number(s.customStonePrice) || 0
    })) : [];

    const nowIso = new Date().toISOString();
    const productData = {
      title: data.title.trim(),
      sku: data.sku ? data.sku.trim().toUpperCase() : `DM-${Date.now().toString().slice(-6)}`,
      categoryId: data.categoryId || '',
      categoryTitle: data.categoryTitle || '',
      collectionId: data.collectionId || '',
      collectionTitle: data.collectionTitle || '',
      colorId: data.colorId || '',
      colorTitle: data.colorTitle || '',
      colors: Array.isArray(data.colors) ? data.colors.map(c => ({
        colorId: c.colorId || '',
        colorTitle: c.colorTitle || ''
      })) : [],
      purityId: data.purityId || '',
      purityTitle: data.purityTitle || '',
      grossGoldWeightGrams: Number(data.grossGoldWeightGrams) || 0,
      netGoldWeightGrams: Number(data.netGoldWeightGrams) || 0,
      
      sizes: Array.isArray(data.sizes) ? data.sizes.map(s => ({
        size: s.size || '',
        increaseAmount: Number(s.increaseAmount) || 0
      })) : [],
      height: data.height || '',
      width: data.width || '',
      
      diamondMode: data.diamondMode || 'auto',
      diamonds: cleanDiamonds,
      totalDiamondCarats: cleanDiamonds.reduce((sum, d) => sum + (Number(d.totalDiamondCarats) || 0), 0),
      numberOfDiamonds: cleanDiamonds.reduce((sum, d) => sum + (Number(d.numberOfDiamonds) || 0), 0),
      
      makingChargeBase: Number(data.makingChargeBase) || 0,
      makingChargeDiscountPercent: Number(data.makingChargeDiscountPercent) || 0,
      gstPercent: Number(data.gstPercent) || 3,

      hasGemstone: Boolean(data.hasGemstone),
      stones: cleanStones,

      media: Array.isArray(data.media) ? data.media : [],
      certification: formatCertification(data.certification),
      descriptionHtml: data.descriptionHtml || '',
      showInHomepage: Boolean(data.showInHomepage),
      showInCarousel: Boolean(data.showInCarousel),
      status: data.status || 'Active',
      availability: data.availability || 'Available',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('products').add(productData);

    return {
      id: docRef.id,
      ...productData
    };
  }

  /**
   * Update an existing product (ONLY updates structural data)
   */
  static async updateProduct(id, data) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Product not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.sku !== undefined) updateData.sku = data.sku.trim().toUpperCase();
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.categoryTitle !== undefined) updateData.categoryTitle = data.categoryTitle;
    if (data.collectionId !== undefined) updateData.collectionId = data.collectionId;
    if (data.collectionTitle !== undefined) updateData.collectionTitle = data.collectionTitle;
    if (data.colorId !== undefined) updateData.colorId = data.colorId;
    if (data.colorTitle !== undefined) updateData.colorTitle = data.colorTitle;
    if (data.colors !== undefined) {
      updateData.colors = Array.isArray(data.colors) ? data.colors.map(c => ({
        colorId: c.colorId || '',
        colorTitle: c.colorTitle || ''
      })) : [];
    }
    if (data.purityId !== undefined) updateData.purityId = data.purityId;
    if (data.purityTitle !== undefined) updateData.purityTitle = data.purityTitle;
    if (data.grossGoldWeightGrams !== undefined) updateData.grossGoldWeightGrams = Number(data.grossGoldWeightGrams) || 0;
    if (data.netGoldWeightGrams !== undefined) updateData.netGoldWeightGrams = Number(data.netGoldWeightGrams) || 0;

    if (data.sizes !== undefined) {
      updateData.sizes = Array.isArray(data.sizes) ? data.sizes.map(s => ({
        size: s.size || '',
        increaseAmount: Number(s.increaseAmount) || 0
      })) : [];
    }
    if (data.height !== undefined) updateData.height = data.height;
    if (data.width !== undefined) updateData.width = data.width;

    if (data.diamondMode !== undefined) updateData.diamondMode = data.diamondMode;
    if (data.diamonds !== undefined) {
      updateData.diamonds = Array.isArray(data.diamonds) ? data.diamonds.map(d => ({
        shape: d.shape || 'Round',
        settingType: d.settingType || '',
        diamondQualityId: d.diamondQualityId || '',
        totalDiamondCarats: Number(d.totalDiamondCarats) || 0,
        numberOfDiamonds: Number(d.numberOfDiamonds) || 0,
        customDiamondPrice: Number(d.customDiamondPrice) || 0,
        diamondQualityTitle: d.diamondQualityTitle || ''
      })) : [];
      updateData.totalDiamondCarats = updateData.diamonds.reduce((sum, d) => sum + (Number(d.totalDiamondCarats) || 0), 0);
      updateData.numberOfDiamonds = updateData.diamonds.reduce((sum, d) => sum + (Number(d.numberOfDiamonds) || 0), 0);
    }

    if (data.hasGemstone !== undefined) updateData.hasGemstone = Boolean(data.hasGemstone);
    if (data.stones !== undefined) {
      updateData.stones = Array.isArray(data.stones) ? data.stones.map(s => ({
        stoneId: s.stoneId || '',
        settingType: s.settingType || '',
        stoneWeightCarats: Number(s.stoneWeightCarats) || 0,
        numberOfStones: Number(s.numberOfStones) || 0,
        customStonePrice: Number(s.customStonePrice) || 0
      })) : [];
    }

    if (data.makingChargeBase !== undefined) updateData.makingChargeBase = Number(data.makingChargeBase) || 0;
    if (data.makingChargeDiscountPercent !== undefined) updateData.makingChargeDiscountPercent = Number(data.makingChargeDiscountPercent) || 0;
    if (data.gstPercent !== undefined) updateData.gstPercent = Number(data.gstPercent) || 3;

    if (data.media !== undefined) updateData.media = Array.isArray(data.media) ? data.media : [];
    if (data.certification !== undefined) updateData.certification = formatCertification(data.certification);
    if (data.descriptionHtml !== undefined) updateData.descriptionHtml = data.descriptionHtml;
    if (data.showInHomepage !== undefined) updateData.showInHomepage = Boolean(data.showInHomepage);
    if (data.showInCarousel !== undefined) updateData.showInCarousel = Boolean(data.showInCarousel);
    if (data.status !== undefined) updateData.status = data.status || 'Active';
    if (data.availability !== undefined) updateData.availability = data.availability || 'Available';

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('products').doc(id).delete();
    return { success: true, message: 'Product deleted successfully.' };
  }
}
