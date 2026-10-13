import jwt from 'jsonwebtoken';
import { db, adminAuth } from '../config/firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'goldshop_secret_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a random 8-character password
 */
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Generate a JWT token for an authenticated user
 */
const generateJwtToken = (user) => {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      name: user.name || user.displayName || '',
      role: user.role || 'customer'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export class AuthService {
  /**
   * Generate a JWT token for an authenticated user
   */
  static generateJwtToken(user) {
    return generateJwtToken(user);
  }

  /**
   * Register a new user in Firebase Auth & Firestore DB
   */
  static async registerUser({ name, email, password }) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    let userRecord;
    try {
      // 1. Create Firebase Auth user
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        userRecord = await adminAuth.getUserByEmail(email);
      } else if (error.code === 'auth/configuration-not-found' || error.message?.includes('configuration corresponding')) {
        throw new Error('Email/Password sign-in is disabled in your Firebase Console. Please enable it under Firebase Console -> Authentication -> Sign-in method.');
      } else {
        throw error;
      }
    }

    const userProfile = {
      uid: userRecord.uid,
      name: name || userRecord.displayName || 'User',
      email: email,
      createdAt: new Date().toISOString(),
      role: 'customer'
    };

    // 2. Save user profile to Firestore `users` collection
    try {
      await db.collection('users').doc(userRecord.uid).set(userProfile);
    } catch (dbError) {
      console.error('Firestore save error:', dbError.message);
    }

    // 3. Issue JWT Token
    const token = generateJwtToken(userProfile);

    return {
      user: userProfile,
      token
    };
  }

  /**
   * Login or Sync user via Firebase Client ID Token (e.g. Google Sign-In or Firebase Auth Email/Password)
   */
  static async verifyFirebaseTokenAndLogin(idToken, customName = null) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    const nowIso = new Date().toISOString();

    const displayName = customName || name || email?.split('@')[0] || 'User';

    let existingData = null;
    const userRef = db.collection('users').doc(uid);

    try {
      const docSnap = await userRef.get();
      if (docSnap.exists) {
        existingData = docSnap.data();
      }

      // If document by UID does not exist or has missing role/email, look up by email in users collection
      if ((!existingData || !existingData.role || !existingData.email) && email) {
        const querySnap = await db.collection('users')
          .where('email', '==', email.toLowerCase().trim())
          .limit(1)
          .get();
        if (!querySnap.empty) {
          const matchedData = querySnap.docs[0].data();
          existingData = { ...matchedData, ...(existingData || {}) };
        }
      }
    } catch (dbError) {
      console.error('Firestore lookup error:', dbError.message);
    }

    const resolvedRole = existingData?.role || 'customer';
    const resolvedName = customName || existingData?.name || displayName;
    const resolvedEmail = email || existingData?.email || '';

    const userProfile = {
      uid,
      email: resolvedEmail,
      name: resolvedName,
      photoURL: picture || existingData?.photoURL || '',
      role: resolvedRole,
      createdAt: existingData?.createdAt || nowIso,
      lastSignInAt: nowIso
    };

    try {
      await userRef.set(userProfile, { merge: true });
    } catch (saveError) {
      console.error('Firestore sync error:', saveError.message);
    }

    const token = generateJwtToken(userProfile);

    return {
      user: userProfile,
      token
    };
  }

  /**
   * Get user profile from Firestore DB
   */
  static async getUserProfile(uid, userEmail = null) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    let docSnap = await db.collection('users').doc(uid).get();

    // If not found by UID, check Firestore by email
    let searchEmail = userEmail;
    if ((!docSnap.exists || !docSnap.data()?.role) && !searchEmail && adminAuth) {
      try {
        const authUser = await adminAuth.getUser(uid);
        searchEmail = authUser?.email;
      } catch (e) {}
    }

    if ((!docSnap.exists || !docSnap.data()?.role) && searchEmail) {
      try {
        const querySnap = await db.collection('users')
          .where('email', '==', searchEmail.toLowerCase().trim())
          .limit(1)
          .get();
        if (!querySnap.empty) {
          docSnap = querySnap.docs[0];
        }
      } catch (e) {}
    }

    if (!docSnap.exists) {
      if (adminAuth) {
        try {
          const userRecord = await adminAuth.getUser(uid);
          return {
            uid: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName || '',
            role: 'customer'
          };
        } catch (e) {}
      }
      return {
        uid,
        email: userEmail || '',
        name: userEmail?.split('@')[0] || 'User',
        role: 'customer'
      };
    }

    return { uid, ...docSnap.data() };
  }

  /**
   * Update user profile in Firestore DB & Firebase Auth
   */
  static async updateUserProfile(uid, updateData) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const allowedFields = ['name', 'phone', 'address', 'landmark', 'city', 'state', 'pincode', 'aadhaar', 'panCard', 'addresses'];
    const filteredUpdate = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredUpdate[key] = updateData[key];
      }
    }
    filteredUpdate.updatedAt = new Date().toISOString();

    const userRef = db.collection('users').doc(uid);
    await userRef.set(filteredUpdate, { merge: true });

    if (filteredUpdate.name && adminAuth) {
      try {
        await adminAuth.updateUser(uid, { displayName: filteredUpdate.name });
      } catch (e) {
        console.warn('Could not update Firebase displayName:', e.message);
      }
    }

    const docSnap = await userRef.get();
    return { uid, ...docSnap.data() };
  }

  /**
   * Direct Email/Password login with proper password verification via Firebase Identity Toolkit API
   */
  static async loginUser({ email, password }) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAymkPz3tozEJekj42Y9zZXKU8z-C7apiw';

    // 1. Verify credentials using Firebase Auth REST API
    let uid;
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        const errCode = data.error?.message;
        if (errCode === 'INVALID_PASSWORD' || errCode === 'INVALID_LOGIN_CREDENTIALS') {
          throw new Error('Invalid email or password.');
        } else if (errCode === 'EMAIL_NOT_FOUND') {
          throw new Error('No account found with this email address.');
        } else if (errCode === 'USER_DISABLED') {
          throw new Error('This user account has been disabled.');
        } else if (errCode === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
          throw new Error('Access to this account has been temporarily disabled due to many failed login attempts.');
        } else {
          throw new Error(data.error?.message || 'Invalid email or password.');
        }
      }

      uid = data.localId;
    } catch (authErr) {
      throw authErr;
    }

    const nowIso = new Date().toISOString();

    // 2. Automatically update lastSignInAt in Firestore DB
    try {
      await db.collection('users').doc(uid).set({
        lastSignInAt: nowIso
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Failed to update lastSignInAt in Firestore:', dbErr.message);
    }
    
    // 3. Retrieve User Profile & issue JWT token
    const userProfile = await this.getUserProfile(uid, email);
    const token = generateJwtToken(userProfile);

    return {
      user: { ...userProfile, lastSignInAt: nowIso },
      token
    };
  }

  /**
   * Fetch all Admin Users directly from Firestore `users` collection where role is 'admin'
   */
  static async getAdminUsers() {
    if (!db) {
      throw new Error('Firestore service is not initialized');
    }

    // Query all documents from Firestore users collection
    const snapshot = await db.collection('users').get();
    const adminDocs = [];
    const seenEmails = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data && data.role && (data.role.toLowerCase() === 'admin' || data.role === 'ADMIN')) {
        const emailKey = (data.email || '').toLowerCase().trim();
        // Prevent duplicate entries if same email has multiple docs
        if (emailKey && seenEmails.has(emailKey)) {
          return;
        }
        if (emailKey) {
          seenEmails.add(emailKey);
        }

        adminDocs.push({
          uid: doc.id,
          id: doc.id,
          name: data.name || data.displayName || data.email?.split('@')[0] || 'Admin',
          email: data.email || '',
          role: 'admin',
          lastSignInTime: data.lastSignInAt || data.lastSignInTime || data.updatedAt || 'Recent',
          creationTime: data.createdAt || data.creationTime || 'Recent',
          ...data
        });
      }
    });

    return adminDocs;
  }

  /**
   * Create a new Admin User with an 8-character random password
   */
  static async createAdminUser({ name, email }) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    const generatedPassword = generateRandomPassword(8);

    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password: generatedPassword,
        displayName: name
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new Error('An account with this email address already exists.');
      }
      throw error;
    }

    const adminProfile = {
      uid: userRecord.uid,
      name,
      email,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    // Save to Firestore DB
    await db.collection('users').doc(userRecord.uid).set(adminProfile);

    return {
      user: {
        ...adminProfile,
        lastSignInTime: 'Never',
        creationTime: new Date().toISOString()
      },
      generatedPassword
    };
  }

  /**
   * Delete an Admin User from Firebase Auth & Firestore
   */
  static async deleteAdminUser(uid) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    // 1. Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(uid);
    } catch (err) {
      console.warn('Firebase Auth user delete warning:', err.message);
    }

    // 2. Delete from Firestore DB
    await db.collection('users').doc(uid).delete();

    return { success: true, message: 'Admin user deleted successfully.' };
  }

  /**
   * Update an Admin User name or email
   */
  static async updateAdminUser(uid, { name, email }) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    const updateData = {};
    if (name) updateData.displayName = name;
    if (email) updateData.email = email;

    // 1. Update in Firebase Auth
    if (Object.keys(updateData).length > 0) {
      await adminAuth.updateUser(uid, updateData);
    }

    // 2. Update in Firestore DB
    const firestoreUpdate = {};
    if (name) firestoreUpdate.name = name;
    if (email) firestoreUpdate.email = email;

    await db.collection('users').doc(uid).update(firestoreUpdate);

    return this.getUserProfile(uid);
  }

  /**
   * Fetch Paginated Customers List with order statistics (total spent, total orders, last order date)
   */
  static async getCustomers({ page = 1, limit = 10, search = '' }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const searchTerm = (search || '').trim().toLowerCase();

    // 1. Fetch all non-admin users from Firestore users collection
    const usersSnapshot = await db.collection('users').get();
    const customerMap = new Map();

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const role = (data.role || 'customer').toLowerCase();
      if (role !== 'admin') {
        const key = (data.email || data.phone || doc.id).toLowerCase();
        customerMap.set(key, {
          id: doc.id,
          uid: doc.id,
          name: data.name || data.displayName || 'Customer',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'customer',
          city: data.city || '',
          state: data.state || '',
          joined: data.createdAt || data.lastSignInAt || new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: null
        });
      }
    });

    // 2. Fetch all orders to compute customer stats (total spent, order count) & discover non-registered buyers
    try {
      const ordersSnapshot = await db.collection('orders').get();
      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        const emailKey = (order.customerEmail || '').toLowerCase();
        const phoneKey = (order.customerPhone || '').toLowerCase();
        const userIdKey = (order.userId || '').toLowerCase();

        // Match with existing customer in map
        let key = null;
        if (userIdKey && customerMap.has(userIdKey)) {
          key = userIdKey;
        } else if (emailKey && customerMap.has(emailKey)) {
          key = emailKey;
        } else if (phoneKey && customerMap.has(phoneKey)) {
          key = phoneKey;
        }

        const orderAmount = Number(order.totalAmount || order.productPrice || 0);
        const isPaid = order.paymentStatus === 'Paid' || order.orderType === 'paid_order' || !!order.razorpayPaymentId;

        if (key) {
          const cust = customerMap.get(key);
          cust.ordersCount += 1;
          if (isPaid) {
            cust.totalSpent += orderAmount;
          }
          if (!cust.phone && order.customerPhone) cust.phone = order.customerPhone;
          if (!cust.city && order.city) cust.city = order.city;
          if (!cust.state && order.state) cust.state = order.state;
          if (!cust.lastOrderDate || new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
            cust.lastOrderDate = order.createdAt;
          }
        } else if (emailKey || phoneKey || order.customerName) {
          const newKey = emailKey || phoneKey || doc.id;
          customerMap.set(newKey, {
            id: doc.id,
            uid: order.userId || doc.id,
            name: order.customerName || 'Guest Buyer',
            email: order.customerEmail || '',
            phone: order.customerPhone || '',
            role: 'customer',
            city: order.city || '',
            state: order.state || '',
            joined: order.createdAt || new Date().toISOString(),
            ordersCount: 1,
            totalSpent: isPaid ? orderAmount : 0,
            lastOrderDate: order.createdAt || null
          });
        }
      });
    } catch (err) {
      console.warn('Orders aggregation warning in getCustomers:', err.message);
    }

    let allCustomers = Array.from(customerMap.values());

    // 3. Search Filter
    if (searchTerm) {
      allCustomers = allCustomers.filter(c => 
        (c.name && c.name.toLowerCase().includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm)) ||
        (c.phone && c.phone.toLowerCase().includes(searchTerm)) ||
        (c.city && c.city.toLowerCase().includes(searchTerm)) ||
        (c.state && c.state.toLowerCase().includes(searchTerm))
      );
    }

    // 4. Sort (Highest spent first, then newest joined)
    allCustomers.sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) {
        return b.totalSpent - a.totalSpent;
      }
      return new Date(b.joined || 0) - new Date(a.joined || 0);
    });

    // 5. Backend Pagination
    const totalCount = allCustomers.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedCustomers = allCustomers.slice(startIndex, startIndex + limitNum);

    return {
      data: paginatedCustomers,
      pagination: {
        totalCount,
        totalPages,
        page: pageNum,
        limit: limitNum
      }
    };
  }
}
