import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if we have the config, otherwise it throws errors.
// This allows the app to start locally without Firebase config.
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.warn('Firebase config missing or invalid. App will run without auth capabilities.');
}

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  return signInWithPopup(auth, googleProvider);
};

export const signOut = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  return firebaseSignOut(auth);
};
