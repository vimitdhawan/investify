// firebase.ts
import type { ServiceAccount } from "firebase-admin";
import * as admin from "firebase-admin";

declare global {
  var _firebaseAdminInstance: typeof admin | undefined;
}

if (!global._firebaseAdminInstance) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      } as ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  global._firebaseAdminInstance = admin;
}

const firestore = global._firebaseAdminInstance.firestore();
const bucket = global._firebaseAdminInstance.storage().bucket();
const auth = global._firebaseAdminInstance.auth();

export { firestore, bucket, auth };
