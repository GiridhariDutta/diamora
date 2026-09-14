import { db } from '../config/firebase.js';

export class DiamondColorService {
  /**
   * Fetch all diamond colors sorted by order (ascending)
   */
  static async getAllDiamondColors() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('diamondColors').get();
    let diamondColors = [];

    snapshot.forEach(doc => {
      diamondColors.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order ascending
    diamondColors.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return diamondColors;
  }

  /**
   * Create a new diamond color
   */
  static async createDiamondColor({ title, order = 0, status = 'Active' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Diamond color title is required.');
    }

    const nowIso = new Date().toISOString();
    const colorData = {
      title: title.trim(),
      order: Number(order) || 0,
      status: status || 'Active',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('diamondColors').add(colorData);

    return {
      id: docRef.id,
      ...colorData
    };
  }

  /**
   * Update an existing diamond color
   */
  static async updateDiamondColor(id, { title, order, status }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('diamondColors').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Diamond color not found');
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
   * Delete a diamond color
   */
  static async deleteDiamondColor(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('diamondColors').doc(id).delete();
    return { success: true, message: 'Diamond color deleted successfully.' };
  }

  /**
   * Batch update order sequence for diamond colors
   */
  static async reorderDiamondColors(orderedItems) {
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
        const ref = db.collection('diamondColors').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Diamond color display order updated successfully.' };
  }
}
