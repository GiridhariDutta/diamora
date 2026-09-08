import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional local credential path for local development fallback
const credentialPath = process.env.FIREBASE_CREDENTIALS_PATH ||
  path.resolve(__dirname, '../../../cradencial/diamora-e3448-firebase-adminsdk-fbsvc-0dbbe99b14.json');

const projectId = process.env.FIREBASE_PROJECT_ID || 'diamora-e3448';
const storageBucket = process.env.STORAGE_BUCKET || 'diamora-e3448.firebasestorage.app';

if (!getApps().length) {
  try {
    if (fs.existsSync(credentialPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
        storageBucket
      });
      console.log('✅ Firebase Admin SDK initialized using local Service Account key');
    } else {
      // Cloud Run / Google Application Default Credentials (ADC) approach (No JSON file required)
      initializeApp({
        projectId,
        storageBucket
      });
      console.log('✅ Firebase Admin SDK initialized using Application Default Credentials (Cloud Run Mode)');
    }
  } catch (error) {
    console.warn('⚠️ Service account load error, falling back to default credentials:', error.message);
    try {
      initializeApp({ projectId, storageBucket });
    } catch (e) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', e.message);
    }
  }
}

export const db = getApps().length ? getFirestore() : null;
export const adminAuth = getApps().length ? getAuth() : null;
export const bucket = getApps().length ? getStorage().bucket(storageBucket) : null;
export default getApps()[0];
