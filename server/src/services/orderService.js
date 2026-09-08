import { db } from '../config/firebase.js';

export class OrderService {
  /**
   * Fetch all orders/inquiries sorted by createdAt (descending)
   */
  static async getAllOrders() {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('orders').get();
    let orders = [];

    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return orders;
  }

  /**
   * Create a new product inquiry / order
   */
  static async createOrder({
    customerName,
    customerPhone,
    customerEmail = '',
    notes = '',
    productId = '',
    productTitle = '',
    productSku = '',
    productPrice = 0,
    productImage = '',
    selectedMetal = '',
    selectedColor = '',
    userId = ''
  }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!customerName || !customerName.trim()) {
      throw new Error('Customer Name is required');
    }

    if (!customerPhone || !customerPhone.trim()) {
      throw new Error('Customer Phone Number is required');
    }

    const nowIso = new Date().toISOString();

    const orderData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      notes: notes ? notes.trim() : '',
      productId: productId || '',
      productTitle: productTitle || 'General Product Inquiry',
      productSku: productSku || '',
      productPrice: productPrice || 0,
      productImage: productImage || '',
      selectedMetal: selectedMetal || '',
      selectedColor: selectedColor || '',
      userId: userId || '',
      status: 'New', // Default status: 'New' (unread by admin)
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const docRef = await db.collection('orders').add(orderData);

    return {
      id: docRef.id,
      ...orderData
    };
  }

  /**
   * Update order status (e.g. 'New' -> 'Viewed')
   */
  static async updateOrderStatus(id, { status }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docRef = db.collection('orders').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Order not found');
    }

    const updateData = {
      status: status || 'Viewed',
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updateData);

    return {
      id,
      ...docSnap.data(),
      ...updateData
    };
  }

  /**
   * Delete an order/inquiry
   */
  static async deleteOrder(id) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    await db.collection('orders').doc(id).delete();
    return { success: true, message: 'Order/Inquiry deleted successfully.' };
  }
}
