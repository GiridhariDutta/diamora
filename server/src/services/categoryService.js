import { db } from '../config/firebase.js';
import { StorageService } from './storageService.js';

export class CategoryService {
  /**
   * Fetch all categories sorted by order (ascending)
   */
  static async getAllCategories() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('categories').get();
    let categories = [];

    snapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order ascending
    categories.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return categories;
  }

  /**
   * Create a new category
   * Moves image from temp/ to categories/ if uploaded to temp
   */
  static async createCategory({ title, heading, order = 0, status = 'Active', imageUrl = '' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Category title is required.');
    }

    // Move image from temp/ to categories/ if it's a temporary upload
    let finalImageUrl = imageUrl || '';
    if (finalImageUrl) {
      finalImageUrl = await StorageService.moveFromTemp(finalImageUrl, 'categories', 'cat');
    }

    const nowIso = new Date().toISOString();
    const categoryData = {
      title: title.trim(),
      heading: heading ? heading.trim() : '',
      order: Number(order) || 0,
      status: status || 'Active',
      imageUrl: finalImageUrl,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('categories').add(categoryData);

    return {
      id: docRef.id,
      ...categoryData
    };
  }

  /**
   * Update an existing category
   * Moves image from temp/ to categories/ if a new temporary image was uploaded
   */
  static async updateCategory(id, { title, heading, order, status, imageUrl }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('categories').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Category not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (heading !== undefined) updateData.heading = heading.trim();
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (status !== undefined) updateData.status = status;
    
    if (imageUrl !== undefined) {
      const oldImageUrl = docSnap.data()?.imageUrl;
      const newImageUrl = await StorageService.moveFromTemp(imageUrl, 'categories', 'cat');
      updateData.imageUrl = newImageUrl;

      // Delete previous image from Firebase Storage if replaced with a new image
      if (oldImageUrl && oldImageUrl !== newImageUrl) {
        await StorageService.deleteFileFromStorage(oldImageUrl);
      }
    }

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a category and clean up its associated image file from Firebase Storage
   */
  static async deleteCategory(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('categories').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const categoryData = docSnap.data();
      if (categoryData?.imageUrl) {
        // Delete associated image file from Firebase Storage bucket
        await StorageService.deleteFileFromStorage(categoryData.imageUrl);
      }
      await docRef.delete();
    }

    return { success: true, message: 'Category deleted successfully.' };
  }

  /**
   * Batch update order sequence for categories
   */
  static async reorderCategories(orderedItems) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!Array.isArray(orderedItems)) {
      throw new Error('Invalid ordered items array');
    }

    const batch = db.batch();
    const nowIso = new Date().toISOString();

    orderedItems.forEach((item, index) => {
      if (item.id) {
        const ref = db.collection('categories').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Category display order updated successfully.' };
  }

  /**
   * Upload image file to `temp/` folder in Firebase Storage bucket & get temporary public URL
   */
  static async uploadCategoryImage(file) {
    return StorageService.uploadToTemp(file);
  }
}
