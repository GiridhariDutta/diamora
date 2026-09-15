import { db } from '../config/firebase.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export class OrderService {
  /**
   * Fetch all orders/inquiries sorted by createdAt (descending)
   */
  static async getAllOrders(userId = null) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const snapshot = await db.collection('orders').get();
    let orders = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!userId || data.userId === userId || data.customerEmail === userId) {
        orders.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return orders;
  }

  /**
   * Create Razorpay Order with strict Profile Completeness and Backend Price Verification
   */
  static async createRazorpayOrder({ items, shippingDetails, totalAmount, userId }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    // 1. Check user profile completeness on server
    let userProfile = null;
    if (userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userProfile = userDoc.data();
      }
    }

    const name = (userProfile?.name || shippingDetails?.customerName || '').trim();
    const email = (userProfile?.email || shippingDetails?.customerEmail || '').trim();
    const phone = (userProfile?.phone || shippingDetails?.customerPhone || '').replace(/\D/g, '');
    const aadhaar = (userProfile?.aadhaar || '').replace(/\D/g, '');

    if (!name || name.length < 2) {
      throw new Error('Profile Incomplete: Full Legal Name must be filled in your profile before payment.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Profile Incomplete: Registered Email Address must be filled in your profile before payment.');
    }
    if (phone.length !== 10) {
      throw new Error('Profile Incomplete: A valid 10-digit Phone Number must be saved in your profile before payment.');
    }
    if (aadhaar.length !== 12) {
      throw new Error('Profile Incomplete: A valid 12-digit Aadhaar Card Number must be saved in your profile before payment.');
    }

    // 2. Product Price Verification against live database
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Shopping cart is empty.');
    }

    let serverCalculatedTotal = 0;
    for (const item of items) {
      let liveProduct = null;
      if (item.productId) {
        const pDoc = await db.collection('products').doc(String(item.productId)).get();
        if (pDoc.exists) {
          liveProduct = pDoc.data();
        }
      }

      const price = Number(liveProduct?.grandTotal || liveProduct?.computedGoldPrice || liveProduct?.price || item.price || 0);
      const qty = Number(item.quantity) || 1;
      serverCalculatedTotal += (price * qty);
    }

    if (Math.abs(serverCalculatedTotal - Number(totalAmount)) > 1) {
      throw new Error(`Price verification failed! Server price (₹${serverCalculatedTotal.toLocaleString('en-IN')}) does not match submitted total. Payment blocked.`);
    }

    // 3. Initialize Razorpay SDK with environment keys
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TakfYozY9UOoTU';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'yP12KfisBoHB64pC86Pk8hzV';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amountInPaise = Math.round(serverCalculatedTotal * 100);

    // Razorpay standard test mode API limits individual order transactions to max ₹5,00,000 (50,00,000 Paise / 50000000 Paise).
    // For luxury diamond purchases > ₹5,00,000 (e.g. ₹8,30,170), cap the payment request to ₹5,00,000 for Razorpay test API limit compliance
    // while preserving the true verified total (₹8,30,170.00) for the order stored in Firestore.
    const MAX_RAZORPAY_TEST_PAISE = 50000000; // ₹5,00,000 in paise
    const amountForRazorpay = Math.min(amountInPaise, MAX_RAZORPAY_TEST_PAISE);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountForRazorpay,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customerName: name,
        customerPhone: phone,
        userId: userId || ''
      }
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      verifiedTotal: serverCalculatedTotal
    };
  }

  /**
   * Verify Razorpay Payment Signature and Save Paid Order to Firestore
   */
  static async verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, items, shippingDetails, totalAmount, userId }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'yP12KfisBoHB64pC86Pk8hzV';
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new Error('Payment verification failed! Invalid Razorpay signature detected.');
    }

    const nowIso = new Date().toISOString();

    const orderData = {
      customerName: (shippingDetails.customerName || '').trim(),
      customerPhone: (shippingDetails.customerPhone || '').trim(),
      customerEmail: (shippingDetails.customerEmail || '').trim(),
      shippingAddress: (shippingDetails.shippingAddress || '').trim(),
      landmark: (shippingDetails.landmark || '').trim(),
      city: (shippingDetails.city || '').trim(),
      state: (shippingDetails.state || '').trim(),
      pincode: (shippingDetails.pincode || '').trim(),
      notes: (shippingDetails.notes || '').trim(),
      userId: userId || '',
      items: items || [],
      totalAmount: totalAmount || 0,
      paymentMethod: 'Razorpay Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'Paid Order',
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
   * Create a new product inquiry / order
   */
  static async createOrder(data = {}) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const {
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
      userId = '',
      items = [],
      totalAmount = 0,
      paymentMethod = 'Razorpay Online',
      shippingAddress = '',
      city = '',
      state = '',
      pincode = ''
    } = data;

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
      productId: productId || (items.length > 0 ? items[0].productId : ''),
      productTitle: productTitle || (items.length > 0 ? items.map(i => i.title).join(', ') : 'Haute Joaillerie Order'),
      productSku: productSku || '',
      productPrice: productPrice || totalAmount || 0,
      productImage: productImage || (items.length > 0 ? items[0].image : ''),
      selectedMetal: selectedMetal || '',
      selectedColor: selectedColor || '',
      userId: userId || '',
      items: items || [],
      totalAmount: totalAmount || productPrice || 0,
      paymentMethod: paymentMethod || 'Razorpay Online',
      shippingAddress: shippingAddress || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      status: 'Paid Order',
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
    return { success: true, message: 'Order deleted successfully.' };
  }
}

