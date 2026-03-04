// features/portfolio/portfolio.repository.ts

import {
  getDocument,
  getSubCollection,
  getNestedSubCollection,
} from '@/lib/db';

import { Scheme } from '@/features/schemes/type';
import { firestore } from '@/lib/firebase';

const schemeCache = new Map<string, Scheme[]>();

export async function getSchemes(userId: string): Promise<Scheme[]> {
  // 4️⃣ Get schemes
  const schemesSnap = await firestore
    .collection('users')
    .doc(userId)
    .collection('schemes')
    .get();

  const schemes = await Promise.all(
    schemesSnap.docs.map(async (schemeDoc) => {
      const schemeData = schemeDoc.data() as Scheme;
      return {
        ...schemeData,
        id: schemeDoc.id,
      };
    })
  );

  // 5️⃣ Cache it
  schemeCache.set(userId, schemes);
  return schemes;
}
