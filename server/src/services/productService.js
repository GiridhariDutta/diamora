import { db } from '../config/firebase.js';

const formatCertification = (cert) => {
  if (!cert || typeof cert !== 'string') return '100% Certified';
  const cleaned = cert
    .replace(/&\s*BIS\s*Hallmarked/gi, '')
    .replace(/BIS\s*Hallmarked\s*&?/gi, '')
    .trim();
  return cleaned || '100% Certified';
};

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
    let products = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        certification: formatCertification(data.certification)
      });
    });

    // 1. Sort by createdAt descending
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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
        (p.colorTitle && p.colorTitle.toLowerCase().includes(colorQuery))
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

    // 7. Filter by price range if provided
    if (price && typeof price === 'string' && price.trim() !== '') {
      const priceKey = price.trim().toLowerCase();
      products = products.filter(p => {
        const itemPrice = Number(p.grandTotal || p.computedGoldPrice || 0);
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

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      certification: formatCertification(data.certification)
    };
  }

  /**
   * Create a new product
   */
  static async createProduct(data) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!data.title || !data.title.trim()) {
      throw new Error('Product title is required.');
    }

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
      purityId: data.purityId || '',
      purityTitle: data.purityTitle || '',
      purityRatePerGram: Number(data.purityRatePerGram) || 0,
      netGoldWeightGrams: Number(data.netGoldWeightGrams) || 0,
      
      diamondMode: data.diamondMode || 'auto',
      diamonds: Array.isArray(data.diamonds) ? data.diamonds : [],
      diamondQualityId: data.diamondQualityId || '',
      diamondQualityTitle: data.diamondQualityTitle || '',
      diamondRatePerCarat: Number(data.diamondRatePerCarat) || 0,
      totalDiamondCarats: Number(data.totalDiamondCarats) || 0,
      numberOfDiamonds: Number(data.numberOfDiamonds) || 0,
      customDiamondPrice: Number(data.customDiamondPrice) || 0,
      
      makingChargeBase: Number(data.makingChargeBase) || 0,
      makingChargeDiscountPercent: Number(data.makingChargeDiscountPercent) || 0,
      gstPercent: Number(data.gstPercent) || 3,

      hasGemstone: Boolean(data.hasGemstone),
      stones: Array.isArray(data.stones) ? data.stones : [],
      computedStonePrice: Number(data.computedStonePrice) || 0,

      computedGoldPrice: Number(data.computedGoldPrice) || 0,
      computedDiamondPrice: Number(data.computedDiamondPrice) || 0,
      computedMakingCharges: Number(data.computedMakingCharges) || 0,
      computedGst: Number(data.computedGst) || 0,
      grandTotal: Number(data.grandTotal) || 0,

      media: Array.isArray(data.media) ? data.media : [],
      certification: formatCertification(data.certification),
      descriptionHtml: data.descriptionHtml || '',
      showInHomepage: Boolean(data.showInHomepage),
      showInCarousel: Boolean(data.showInCarousel),
      status: data.status || 'Active',
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
   * Update an existing product
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
    if (data.purityId !== undefined) updateData.purityId = data.purityId;
    if (data.purityTitle !== undefined) updateData.purityTitle = data.purityTitle;
    if (data.purityRatePerGram !== undefined) updateData.purityRatePerGram = Number(data.purityRatePerGram) || 0;
    if (data.netGoldWeightGrams !== undefined) updateData.netGoldWeightGrams = Number(data.netGoldWeightGrams) || 0;

    if (data.diamondMode !== undefined) updateData.diamondMode = data.diamondMode;
    if (data.diamonds !== undefined) updateData.diamonds = Array.isArray(data.diamonds) ? data.diamonds : [];
    if (data.diamondQualityId !== undefined) updateData.diamondQualityId = data.diamondQualityId;
    if (data.diamondQualityTitle !== undefined) updateData.diamondQualityTitle = data.diamondQualityTitle;
    if (data.diamondRatePerCarat !== undefined) updateData.diamondRatePerCarat = Number(data.diamondRatePerCarat) || 0;
    if (data.totalDiamondCarats !== undefined) updateData.totalDiamondCarats = Number(data.totalDiamondCarats) || 0;
    if (data.numberOfDiamonds !== undefined) updateData.numberOfDiamonds = Number(data.numberOfDiamonds) || 0;
    if (data.customDiamondPrice !== undefined) updateData.customDiamondPrice = Number(data.customDiamondPrice) || 0;

    if (data.hasGemstone !== undefined) updateData.hasGemstone = Boolean(data.hasGemstone);
    if (data.stones !== undefined) updateData.stones = Array.isArray(data.stones) ? data.stones : [];
    if (data.computedStonePrice !== undefined) updateData.computedStonePrice = Number(data.computedStonePrice) || 0;

    if (data.makingChargeBase !== undefined) updateData.makingChargeBase = Number(data.makingChargeBase) || 0;
    if (data.makingChargeDiscountPercent !== undefined) updateData.makingChargeDiscountPercent = Number(data.makingChargeDiscountPercent) || 0;
    if (data.gstPercent !== undefined) updateData.gstPercent = Number(data.gstPercent) || 3;

    if (data.computedGoldPrice !== undefined) updateData.computedGoldPrice = Number(data.computedGoldPrice) || 0;
    if (data.computedDiamondPrice !== undefined) updateData.computedDiamondPrice = Number(data.computedDiamondPrice) || 0;
    if (data.computedMakingCharges !== undefined) updateData.computedMakingCharges = Number(data.computedMakingCharges) || 0;
    if (data.computedGst !== undefined) updateData.computedGst = Number(data.computedGst) || 0;
    if (data.grandTotal !== undefined) updateData.grandTotal = Number(data.grandTotal) || 0;

    if (data.media !== undefined) updateData.media = Array.isArray(data.media) ? data.media : [];
    if (data.certification !== undefined) updateData.certification = formatCertification(data.certification);
    if (data.descriptionHtml !== undefined) updateData.descriptionHtml = data.descriptionHtml;
    if (data.showInHomepage !== undefined) updateData.showInHomepage = Boolean(data.showInHomepage);
    if (data.showInCarousel !== undefined) updateData.showInCarousel = Boolean(data.showInCarousel);
    if (data.status !== undefined) updateData.status = data.status || 'Active';


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
