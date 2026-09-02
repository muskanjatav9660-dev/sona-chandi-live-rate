import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// Helper to safely get vite env
const getEnv = (key: string, fallback: string = ''): string => {
  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // fallback
  }
  return fallback;
};

// User's Real Firebase Project Config
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyDprrBUSCQBVbd-JYx7_LbhyUyLQvfUMAK'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'sona-chandi-live-rate.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'sona-chandi-live-rate'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'sona-chandi-live-rate.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '965918467885'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:965918467885:android:e50d688d4ce7c99e7fd5a4'),
};

// Singleton initialization with error boundary
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
};
export type { FirebaseUser };
