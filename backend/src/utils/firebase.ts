import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = '/Users/sathvikreddy/Documents/gemini/sports-b5755-firebase-adminsdk-fbsvc-7121a451a0.json';

try {
  if (!getApps().length) {
    if (fs.existsSync(serviceAccountPath)) {
      initializeApp({
        credential: cert(require(serviceAccountPath))
      });
    } else {
      console.warn('Firebase service account not found, using default env credentials');
      initializeApp();
    }
    console.log('Firebase Admin initialized.');
  }
} catch (error) {
  console.error('Firebase Admin initialization error', error);
}

export const auth = getAuth();
