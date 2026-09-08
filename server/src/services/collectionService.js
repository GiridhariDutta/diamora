import { db } from '../config/firebase.js';

export class CollectionService {
  /**
   * Fetch all collections sorted by order (ascending)
   */
  static async getAllCollections() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('collections').get();
    let collections = [];

    snapshot.forEach(doc => {
      collections.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by order ascending
    collections.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return collections;
  }

  /**
   * Create a new collection
   */
  static async createCollection({ title, heading, order = 0, status = 'Active' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!title) {
      throw new Error('Collection title is required.');
    }

    const nowIso = new Date().toISOString();
    const collectionData = {
      title: title.trim(),
      heading: heading ? heading.trim() : '',
      order: Number(order) || 0,
      status: status || 'Active',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('collections').add(collectionData);

    return {
      id: docRef.id,
      ...collectionData
    };
  }

  /**
   * Update an existing collection
   */
  static async updateCollection(id, { title, heading, order, status }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('collections').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Collection not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (heading !== undefined) updateData.heading = heading.trim();
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
   * Delete a collection
   */
  static async deleteCollection(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('collections').doc(id).delete();
    return { success: true, message: 'Collection deleted successfully.' };
  }

  /**
   * Batch update order sequence for collections
   */
  static async reorderCollections(orderedItems) {
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
        const ref = db.collection('collections').doc(item.id);
        batch.update(ref, {
          order: index + 1,
          updatedAt: nowIso
        });
      }
    });

    await batch.commit();
    return { success: true, message: 'Collection display order updated successfully.' };
  }
}
