import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const isProd = process.env.NODE_ENV === 'production';
const bucketName = process.env.STORAGE_BUCKET || (isProd ? 'diamora-508307.firebasestorage.app' : 'diamora-e3448.firebasestorage.app');

if (!getApps().length) {
  try {
    // In production (Cloud Run), this automatically uses Application Default Credentials.
    // In local development, it uses the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    initializeApp({
      storageBucket: bucketName
    });
    console.log(`✅ Firebase Admin SDK initialized (Bucket: ${bucketName})`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
}

export const db = getApps().length ? getFirestore() : null;
export const adminAuth = getApps().length ? getAuth() : null;
export const bucket = getApps().length ? getStorage().bucket(bucketName) : null;
export default getApps()[0];
