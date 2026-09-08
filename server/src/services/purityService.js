import { db } from '../config/firebase.js';

export class PurityService {
  /**
   * Fetch all purities sorted by order (ascending)
   */
  static async getAllPurities() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('purities').get();
    let purities = [];

    snapshot.forEach(doc => {
      purities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order ascending
    purities.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return purities;
  }

  /**
   * Create a new purity
   */
  static async createPurity({ title, order = 0, status = 'Active', ratePerGram = 0 }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Purity title is required.');
    }

    const nowIso = new Date().toISOString();
    const purityData = {
      title: title.trim(),
      order: Number(order) || 0,
      status: status || 'Active',
      ratePerGram: Number(ratePerGram) || 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('purities').add(purityData);

    return {
      id: docRef.id,
      ...purityData
    };
  }

  /**
   * Update an existing purity
   */
  static async updatePurity(id, { title, order, status, ratePerGram }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('purities').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Purity not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (status !== undefined) updateData.status = status;
    if (ratePerGram !== undefined) updateData.ratePerGram = Number(ratePerGram) || 0;

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a purity
   */
  static async deletePurity(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('purities').doc(id).delete();
    return { success: true, message: 'Purity deleted successfully.' };
  }

  /**
   * Batch update order sequence for purities
   */
  static async reorderPurities(orderedItems) {
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
        const ref = db.collection('purities').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Purity display order updated successfully.' };
  }
}
