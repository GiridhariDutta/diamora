import { db } from '../config/firebase.js';

export class ProductService {
  /**
   * Fetch all products sorted by createdAt descending
   */
  static async getAllProducts() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('products').get();
    let products = [];

    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return products;
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

    return {
      id: docSnap.id,
      ...docSnap.data()
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

      computedGoldPrice: Number(data.computedGoldPrice) || 0,
      computedDiamondPrice: Number(data.computedDiamondPrice) || 0,
      computedMakingCharges: Number(data.computedMakingCharges) || 0,
      computedGst: Number(data.computedGst) || 0,
      grandTotal: Number(data.grandTotal) || 0,

      media: Array.isArray(data.media) ? data.media : [],
      certification: data.certification || 'BIS Hallmarked & Certified',
      descriptionHtml: data.descriptionHtml || '',
      showInHomepage: Boolean(data.showInHomepage),
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

    if (data.makingChargeBase !== undefined) updateData.makingChargeBase = Number(data.makingChargeBase) || 0;
    if (data.makingChargeDiscountPercent !== undefined) updateData.makingChargeDiscountPercent = Number(data.makingChargeDiscountPercent) || 0;
    if (data.gstPercent !== undefined) updateData.gstPercent = Number(data.gstPercent) || 3;

    if (data.computedGoldPrice !== undefined) updateData.computedGoldPrice = Number(data.computedGoldPrice) || 0;
    if (data.computedDiamondPrice !== undefined) updateData.computedDiamondPrice = Number(data.computedDiamondPrice) || 0;
    if (data.computedMakingCharges !== undefined) updateData.computedMakingCharges = Number(data.computedMakingCharges) || 0;
    if (data.computedGst !== undefined) updateData.computedGst = Number(data.computedGst) || 0;
    if (data.grandTotal !== undefined) updateData.grandTotal = Number(data.grandTotal) || 0;

    if (data.media !== undefined) updateData.media = Array.isArray(data.media) ? data.media : [];
    if (data.certification !== undefined) updateData.certification = data.certification;
    if (data.descriptionHtml !== undefined) updateData.descriptionHtml = data.descriptionHtml;
    if (data.showInHomepage !== undefined) updateData.showInHomepage = Boolean(data.showInHomepage);
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
