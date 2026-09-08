import { db } from '../config/firebase.js';

export class ColorService {
  /**
   * Fetch all colors sorted by order (ascending)
   */
  static async getAllColors() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('colors').get();
    let colors = [];

    snapshot.forEach(doc => {
      colors.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order ascending
    colors.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return colors;
  }

  /**
   * Create a new color
   */
  static async createColor({ title, order = 0, status = 'Active' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Color title is required.');
    }

    const nowIso = new Date().toISOString();
    const colorData = {
      title: title.trim(),
      order: Number(order) || 0,
      status: status || 'Active',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('colors').add(colorData);

    return {
      id: docRef.id,
      ...colorData
    };
  }

  /**
   * Update an existing color
   */
  static async updateColor(id, { title, order, status }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('colors').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Color not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (status !== undefined) updateData.status = status;

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a color
   */
  static async deleteColor(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('colors').doc(id).delete();
    return { success: true, message: 'Color deleted successfully.' };
  }

  /**
   * Batch update order sequence for colors
   */
  static async reorderColors(orderedItems) {
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
        const ref = db.collection('colors').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Color display order updated successfully.' };
  }
}
