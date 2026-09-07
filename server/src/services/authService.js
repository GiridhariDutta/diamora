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
   * Login or Sync user via Firebase Client ID Token (e.g. Google Sign-In or Firebase Auth)
   */
  static async verifyFirebaseTokenAndLogin(idToken) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let userProfile = {
      uid,
      email: email || '',
      name: name || email?.split('@')[0] || 'User',
      photoURL: picture || '',
      createdAt: new Date().toISOString(),
      role: 'customer'
    };

    try {
      const userRef = db.collection('users').doc(uid);
      const docSnap = await userRef.get();

      if (!docSnap.exists) {
        await userRef.set(userProfile);
      } else {
        userProfile = docSnap.data();
      }
    } catch (dbError) {
      console.error('Firestore sync error:', dbError.message);
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
  static async getUserProfile(uid) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    const docSnap = await db.collection('users').doc(uid).get();

    if (!docSnap.exists) {
      if (adminAuth) {
        const userRecord = await adminAuth.getUser(uid);
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName || '',
          role: 'customer'
        };
      }
      throw new Error('User profile not found');
    }

    return docSnap.data();
  }

  /**
   * Direct Email/Password login fallback
   */
  static async loginUser({ email, password }) {
    if (!adminAuth || !db) {
      throw new Error('Firebase Admin service is not initialized');
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      }
      throw error;
    }
    
    const userProfile = await this.getUserProfile(userRecord.uid);
    const token = generateJwtToken(userProfile);

    return {
      user: userProfile,
      token
    };
  }

  /**
   * Fetch all Admin Users and merge lastSignInTime from Firebase Auth Metadata
   */
  static async getAdminUsers() {
    if (!db || !adminAuth) {
      throw new Error('Firebase Admin service is not initialized');
    }

    // 1. Query Firestore users collection
    const snapshot = await db.collection('users').get();
    let adminDocs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.role && (data.role.toLowerCase() === 'admin' || data.role === 'ADMIN')) {
        adminDocs.push({ ...data, uid: doc.id });
      }
    });

    // 2. If no admin documents found in Firestore, check Firebase Auth users directly
    if (adminDocs.length === 0) {
      try {
        const authList = await adminAuth.listUsers(100);
        for (const authUser of authList.users) {
          const adminProfile = {
            uid: authUser.uid,
            name: authUser.displayName || authUser.email?.split('@')[0] || 'Admin',
            email: authUser.email || '',
            role: 'admin',
            createdAt: authUser.metadata.creationTime || new Date().toISOString()
          };
          // Save to Firestore DB so it's persisted for subsequent requests
          await db.collection('users').doc(authUser.uid).set(adminProfile, { merge: true });
          adminDocs.push(adminProfile);
        }
      } catch (authErr) {
        console.warn('Firebase Auth listUsers fallback warning:', authErr.message);
      }
    }

    // 3. Fetch Firebase Auth metadata for each admin user
    const adminUsersWithMetadata = await Promise.all(
      adminDocs.map(async (userDoc) => {
        try {
          const authRecord = await adminAuth.getUser(userDoc.uid);
          return {
            ...userDoc,
            name: userDoc.name || authRecord.displayName || userDoc.email?.split('@')[0] || 'Admin',
            email: userDoc.email || authRecord.email || '',
            lastSignInTime: authRecord.metadata.lastSignInTime || authRecord.metadata.creationTime || 'Recent',
            creationTime: authRecord.metadata.creationTime || userDoc.createdAt || 'Recent'
          };
        } catch (err) {
          return {
            ...userDoc,
            name: userDoc.name || 'Admin',
            lastSignInTime: userDoc.createdAt || 'Recent',
            creationTime: userDoc.createdAt || 'Recent'
          };
        }
      })
    );

    return adminUsersWithMetadata;
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
}
