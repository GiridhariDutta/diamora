import { db } from '../config/firebase.js';

/**
 * Middleware to enforce that the authenticated user has an 'admin' role
 */
export const requireAdminRole = async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges required.'
    });
  }

  // If token role is admin, allow
  if (req.user.role === 'admin' || req.user.role === 'ADMIN') {
    return next();
  }

  // Fallback: Check Firestore DB in case user role was updated after JWT token issue
  try {
    if (db && req.user.uid) {
      const docSnap = await db.collection('users').doc(req.user.uid).get();
      if (docSnap.exists) {
        const userData = docSnap.data();
        if (userData.role && (userData.role.toLowerCase() === 'admin' || userData.role === 'ADMIN')) {
          req.user.role = 'admin';
          return next();
        }
      }
    }
  } catch (err) {
    console.warn('requireAdminRole Firestore check warning:', err.message);
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrative privileges required.'
  });
};

