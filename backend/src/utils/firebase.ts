import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In production, use env vars. For local dev without credentials, this will fail if not provided,
// so we wrap it in a try-catch to allow the server to start if credentials are missing,
// but auth routes will fail when hit.
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'sports-b5755',
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Firebase Admin SDK initialization error (Auth will fail):', (error as Error).message);
}

export const auth = admin.apps.length > 0 ? admin.auth() : null;
