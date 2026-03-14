import type { ServiceAccount } from 'firebase-admin';
import * as admin from 'firebase-admin';

declare global {
  var _firebaseAdminInstance: typeof admin | undefined;
}

if (!global._firebaseAdminInstance) {
  if (!admin.apps.length) {
    const isEmulator = process.env.FIREBASE_EMULATOR_MODE === 'true';
    if (isEmulator) {
      // 1. Manually set the host for Admin SDK if not already in system env
      if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
        process.env.STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
      }
      admin.initializeApp({
        projectId: process.env.FIREBASE_EMULATOR_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_EMULATOR_PROJECT_ID}.firebasestorage.app`,
      });
      console.log(
        `Firebase Admin SDK: Connected to Storage Emulator at ${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
      );
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin SDK: Initialized for production.');
    }
  }
  global._firebaseAdminInstance = admin;
}

// Accessing the bucket
// The emulator suite UI (typically port 4000) will show this bucket once a file is uploaded
export const firestore = global._firebaseAdminInstance.firestore();
export const auth = global._firebaseAdminInstance.auth();
export const bucket = global._firebaseAdminInstance.storage().bucket();
export { admin };
