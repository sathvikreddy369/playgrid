import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

try {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'sports-b5755',
    });
  }
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Firebase Admin SDK initialization error (Auth will fail):', (error as Error).message);
}

export const auth = getApps().length > 0 ? getAuth() : null;
export { getAuth };
