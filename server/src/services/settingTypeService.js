import { db } from '../config/firebase.js';

export class SettingTypeService {
  static async getAllSettingTypes() {
    if (!db) throw new Error('Firestore database is not initialized');
    const snapshot = await db.collection('settingTypes').orderBy('order', 'asc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getSettingTypeById(id) {
    if (!db) throw new Error('Firestore database is not initialized');
    const docSnap = await db.collection('settingTypes').doc(id).get();
    if (!docSnap.exists) throw new Error('Setting Type not found');
    return { id: docSnap.id, ...docSnap.data() };
  }

  static async createSettingType(data) {
    if (!db) throw new Error('Firestore database is not initialized');
    if (!data.title || !data.title.trim()) {
      throw new Error('Setting Type title is required.');
    }

    const settingTypeData = {
      title: data.title.trim(),
      order: Number(data.order) || 0,
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('settingTypes').add(settingTypeData);
    return { id: docRef.id, ...settingTypeData };
  }

  static async updateSettingType(id, data) {
    if (!db) throw new Error('Firestore database is not initialized');
    const docRef = db.collection('settingTypes').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Setting Type not found');

    const updateData = { updatedAt: new Date().toISOString() };
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.order !== undefined) updateData.order = Number(data.order) || 0;
    if (data.status !== undefined) updateData.status = data.status;

    await docRef.update(updateData);
    return { id, ...docSnap.data(), ...updateData };
  }

  static async deleteSettingType(id) {
    if (!db) throw new Error('Firestore database is not initialized');
    const docRef = db.collection('settingTypes').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Setting Type not found');
    await docRef.delete();
    return { message: 'Setting Type deleted successfully' };
  }
}
