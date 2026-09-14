import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAymkPz3tozEJekj42Y9zZXKU8z-C7apiw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "diamora-508307.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "diamora-508307",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "diamora-508307.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "574623635195",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:574623635195:web:04e67a64ed4204847fc25e"
};

// Initialize Firebase client app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

export default app;
