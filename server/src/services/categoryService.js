import { db, bucket } from '../config/firebase.js';

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
   */
  static async createCategory({ title, heading, order = 0, status = 'Active', imageUrl = '' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Category title is required.');
    }

    const nowIso = new Date().toISOString();
    const categoryData = {
      title: title.trim(),
      heading: heading ? heading.trim() : '',
      order: Number(order) || 0,
      status: status || 'Active',
      imageUrl: imageUrl || '',
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
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('categories').doc(id).delete();
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
   * Upload image file to Firebase Storage bucket & get public URL
   */
  static async uploadCategoryImage(file) {
    if (!bucket) {
      throw new Error('Firebase Storage bucket is not initialized');
    }

    if (!file || !file.buffer) {
      throw new Error('No image file provided');
    }

    const fileExtension = file.originalname ? file.originalname.split('.').pop() : 'png';
    const fileName = `categories/cat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype || 'image/png'
      },
      public: true
    });

    // Make public or get public URL
    try {
      await fileRef.makePublic();
    } catch (e) {
      console.warn('makePublic warning:', e.message);
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return { imageUrl: publicUrl, fileName };
  }
}
