import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

if (!getApps().length) {
  try {
    // In production (Cloud Run), this automatically uses Application Default Credentials.
    // In local development, it uses the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    initializeApp({
      ...(process.env.STORAGE_BUCKET && { storageBucket: process.env.STORAGE_BUCKET })
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
}

export const db = getApps().length ? getFirestore() : null;
export const adminAuth = getApps().length ? getAuth() : null;
export const bucket = (getApps().length && process.env.STORAGE_BUCKET) ? getStorage().bucket(process.env.STORAGE_BUCKET) : null;
export default getApps()[0];
