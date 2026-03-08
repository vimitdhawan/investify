// lib/db.ts
import { firestore } from './firebase'; // your initialized instance

/**
 * Deeply converts Firestore Timestamps to JavaScript Dates.
 */
function convertTimestamps(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Handle Firestore Timestamp (checking for both standard instance and plain object representation)
  if (
    typeof data.toDate === 'function' ||
    (data._seconds !== undefined && data._nanoseconds !== undefined)
  ) {
    return typeof data.toDate === 'function'
      ? data.toDate()
      : new Date(data._seconds * 1000 + data._nanoseconds / 1000000);
  }

  if (Array.isArray(data)) {
    return data.map((item: any) => convertTimestamps(item));
  }

  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    converted[key] = convertTimestamps(value);
  }
  return converted;
}

export async function getDocument<T>(
  collection: string,
  docId: string
): Promise<T | null> {
  const snap = await firestore.collection(collection).doc(docId).get();

  if (!snap.exists) return null;

  return convertTimestamps({ ...snap.data(), id: snap.id }) as T;
}

export async function getCollection<T>(collection: string): Promise<T[]> {
  const snap = await firestore.collection(collection).get();

  return snap.docs.map(
    (doc) => convertTimestamps({ ...doc.data(), id: doc.id }) as T
  );
}

export async function getSubCollection<T>(
  collection: string,
  docId: string,
  subCollection: string
): Promise<T[]> {
  const snap = await firestore
    .collection(collection)
    .doc(docId)
    .collection(subCollection)
    .get();

  return snap.docs.map(
    (doc) => convertTimestamps({ ...doc.data(), id: doc.id }) as T
  );
}

export async function getNestedSubCollection<T>(
  collection: string,
  docId: string,
  subCollection: string,
  subDocId: string,
  nestedCollection: string
): Promise<T[]> {
  const snap = await firestore
    .collection(collection)
    .doc(docId)
    .collection(subCollection)
    .doc(subDocId)
    .collection(nestedCollection)
    .get();

  return snap.docs.map(
    (doc) => convertTimestamps({ ...doc.data(), id: doc.id }) as T
  );
}

