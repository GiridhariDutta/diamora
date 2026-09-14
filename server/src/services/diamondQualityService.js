import { db } from '../config/firebase.js';

export class DiamondQualityService {
  /**
   * Fetch all diamond qualities sorted by order ascending
   */
  static async getAllQualities() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('diamondQualities').get();
    let items = [];

    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return items;
  }

  /**
   * Create a new diamond quality grade
   */
  static async createQuality({ clarity = '', color = '', title, ratePerCarat = 0, order = 0, status = 'Active' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const clarityStr = (clarity || '').trim();
    const colorStr = (color || '').trim();
    const finalTitle = (title && title.trim()) 
      ? title.trim() 
      : (colorStr ? `${clarityStr} (${colorStr})` : clarityStr);

    if (!finalTitle) {
      throw new Error('Diamond quality clarity/title is required.');
    }

    const nowIso = new Date().toISOString();
    const itemData = {
      clarity: clarityStr,
      color: colorStr,
      title: finalTitle,
      ratePerCarat: Number(ratePerCarat) || 0,
      order: Number(order) || 0,
      status: status || 'Active',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('diamondQualities').add(itemData);

    return {
      id: docRef.id,
      ...itemData
    };
  }

  /**
   * Update an existing diamond quality grade
   */
  static async updateQuality(id, { clarity, color, title, ratePerCarat, order, status }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('diamondQualities').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Diamond quality not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (clarity !== undefined) updateData.clarity = (clarity || '').trim();
    if (color !== undefined) updateData.color = (color || '').trim();
    if (title !== undefined) updateData.title = title.trim();
    if (ratePerCarat !== undefined) updateData.ratePerCarat = Number(ratePerCarat) || 0;
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (status !== undefined) updateData.status = status;

    // Auto-update combined title if clarity or color was provided without an explicit custom title
    if ((clarity !== undefined || color !== undefined) && !title) {
      const curClarity = updateData.clarity !== undefined ? updateData.clarity : (docSnap.data().clarity || '');
      const curColor = updateData.color !== undefined ? updateData.color : (docSnap.data().color || '');
      updateData.title = curColor ? `${curClarity} (${curColor})` : curClarity;
    }

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete a diamond quality grade
   */
  static async deleteQuality(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('diamondQualities').doc(id).delete();
    return { success: true, message: 'Diamond quality deleted successfully.' };
  }

  /**
   * Batch reorder sequence
   */
  static async reorderQualities(orderedItems) {
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
        const ref = db.collection('diamondQualities').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Diamond quality display order updated.' };
  }
}
