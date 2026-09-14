import { db } from '../config/firebase.js';

export class StoneService {
  /**
   * Fetch all gemstone types sorted by order (ascending)
   */
  static async getAllStones() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('stones').get();
    let stones = [];

    snapshot.forEach(doc => {
      stones.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order ascending
    stones.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return stones;
  }

  /**
   * Create a new gemstone type
   */
  static async createStone({ title, order = 0, status = 'Active', ratePerCarat = 0 }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Stone title is required.');
    }

    const nowIso = new Date().toISOString();
    const stoneData = {
      title: title.trim(),
      order: Number(order) || 0,
      status: status || 'Active',
      ratePerCarat: Number(ratePerCarat) || 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('stones').add(stoneData);

    return {
      id: docRef.id,
      ...stoneData
    };
  }

  /**
   * Update an existing gemstone type
   */
  static async updateStone(id, { title, order, status, ratePerCarat }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('stones').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Gemstone not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (status !== undefined) updateData.status = status;
    if (ratePerCarat !== undefined) updateData.ratePerCarat = Number(ratePerCarat) || 0;

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a gemstone type
   */
  static async deleteStone(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('stones').doc(id).delete();
    return { success: true, message: 'Gemstone deleted successfully.' };
  }

  /**
   * Batch update order sequence for gemstones
   */
  static async reorderStones(orderedItems) {
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
        const ref = db.collection('stones').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Gemstone display order updated successfully.' };
  }
}
