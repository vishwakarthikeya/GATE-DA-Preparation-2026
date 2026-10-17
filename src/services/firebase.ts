import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
export const isMockMode = import.meta.env.VITE_DATA_MODE === 'mock';
export const firebaseConfigured = Object.values(config).every(Boolean);
export const ownerUid = import.meta.env.VITE_FIREBASE_OWNER_UID || '';
export const firebaseApp = !isMockMode && firebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseSetupMessage = isMockMode ? 'Mock mode is explicitly enabled for development.' : !firebaseConfigured ? 'Firebase configuration is incomplete. Add all VITE_FIREBASE_* values to .env.' : !ownerUid ? 'VITE_FIREBASE_OWNER_UID is required before private data can be accessed.' : '';
