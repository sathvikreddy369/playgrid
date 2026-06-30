import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let auth: Auth | null = null;

try {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (projectId && privateKey && clientEmail) {
      initializeApp({
        credential: cert({
          projectId,
          // Private key from env may have escaped newlines
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });
      auth = getAuth();
      console.log('Firebase Admin initialized with env credentials.');
    } else {
      console.warn(
        'Firebase Admin SDK credentials not fully configured. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env'
      );
    }
  } else {
    auth = getAuth();
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export { auth };
