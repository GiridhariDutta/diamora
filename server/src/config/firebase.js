import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Firebase Admin SDK credentials file
const credentialPath = process.env.FIREBASE_CREDENTIALS_PATH ||
  path.resolve(__dirname, '../../../cradencial/diamora-e3448-firebase-adminsdk-fbsvc-0dbbe99b14.json');

let app;

try {
  if (fs.existsSync(credentialPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
    
    app = initializeApp({
      credential: cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } else if (!getApps().length) {
    app = initializeApp();
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
}

export const db = getApps().length ? getFirestore() : null;
export const adminAuth = getApps().length ? getAuth() : null;
export default app;
