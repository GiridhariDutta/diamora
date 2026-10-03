import { db } from '../config/firebase.js';

export class ShapeService {
  static async getAllShapes() {
    if (!db) throw new Error('Firestore database is not initialized');
    const snapshot = await db.collection('shapes').orderBy('order', 'asc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getShapeById(id) {
    if (!db) throw new Error('Firestore database is not initialized');
    const docSnap = await db.collection('shapes').doc(id).get();
    if (!docSnap.exists) throw new Error('Shape not found');
    return { id: docSnap.id, ...docSnap.data() };
  }

  static async createShape(data) {
    if (!db) throw new Error('Firestore database is not initialized');
    if (!data.title || !data.title.trim()) {
      throw new Error('Shape title is required.');
    }

    const shapeData = {
      title: data.title.trim(),
      order: Number(data.order) || 0,
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('shapes').add(shapeData);
    return { id: docRef.id, ...shapeData };
  }

  static async updateShape(id, data) {
    if (!db) throw new Error('Firestore database is not initialized');
    const docRef = db.collection('shapes').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Shape not found');

    const updateData = { updatedAt: new Date().toISOString() };
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.order !== undefined) updateData.order = Number(data.order) || 0;
    if (data.status !== undefined) updateData.status = data.status;

    await docRef.update(updateData);
    return { id, ...docSnap.data(), ...updateData };
  }

  static async deleteShape(id) {
    if (!db) throw new Error('Firestore database is not initialized');
    const docRef = db.collection('shapes').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Shape not found');
    await docRef.delete();
    return { message: 'Shape deleted successfully' };
  }
}
