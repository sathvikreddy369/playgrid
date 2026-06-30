import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { StructuredLogger } from './logger';

let auth: Auth | null = null;

try {
  if (process.env.NODE_ENV !== 'test') {
    const apps = typeof getApps === 'function' ? getApps() : [];
    if (!apps || apps.length === 0) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      if (projectId && privateKey && clientEmail) {
        initializeApp({
          credential: cert({
            projectId,
            privateKey: typeof privateKey === 'string' ? privateKey.replace(/\\n/g, '\n') : privateKey,
            clientEmail,
          }),
        });
        auth = getAuth();
        StructuredLogger.info('Firebase Admin initialized with env credentials.');
      } else {
        StructuredLogger.warn('Firebase Admin SDK credentials not fully configured.');
      }
    } else {
      auth = getAuth();
    }
  }
} catch (error) {
  StructuredLogger.error('Firebase Admin initialization error:', undefined, error);
}

export { auth };
