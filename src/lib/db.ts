// lib/db.ts
import { firestore } from './firebase'; // your initialized instance

export async function getDocument<T>(
  collection: string,
  docId: string
): Promise<T | null> {
  const snap = await firestore.collection(collection).doc(docId).get();

  if (!snap.exists) return null;

  return snap.data() as T;
}

export async function getCollection<T>(collection: string): Promise<T[]> {
  const snap = await firestore.collection(collection).get();

  return snap.docs.map((doc) => doc.data() as T);
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

  return snap.docs.map((doc) => doc.data() as T);
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

  return snap.docs.map((doc) => doc.data() as T);
}
