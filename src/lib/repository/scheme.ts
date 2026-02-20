import { firestore } from '@/lib/firebase';
import { Scheme } from '@/features/schemes/type'; // Assuming Scheme type is defined here or imported

export interface SchemeData {
  amc: string;
  code: string;
  schemeName: string;
  schemeType: string;
  schemeCategory: string;
  schemeNavName: string;
  schemeMinimumAmount: string;
  launchDate: string;
  closureDate: string;
  isinDivPayoutOrGrowth: string;
  isinDivReinvestment: string;
}

// Keep a cache to avoid re-fetching from Firestore on every call within the same process.
let cachedData: SchemeData[] | null = null;

export async function getAllSchemeData(): Promise<SchemeData[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    console.log('Fetching all schemes from Firestore...');
    const snapshot = await firestore.collection('schemes').get();
    if (snapshot.empty) {
      console.log('No documents found in the "schemes" collection.');
      return [];
    }

    const schemes: SchemeData[] = [];
    snapshot.forEach((doc) => {
      schemes.push(doc.data() as SchemeData);
    });

    cachedData = schemes;
    console.log(`Successfully fetched ${schemes.length} schemes.`);
    return schemes;
  } catch (error) {
    console.error('Error fetching schemes from Firestore:', error);
    return [];
  }
}

export async function getSchemesByUserId(userId: string): Promise<Scheme[]> {
  try {
    const schemesRef = firestore
      .collection('users')
      .doc(userId)
      .collection('schemes');
    const snapshot = await schemesRef.get();

    if (snapshot.empty) {
      return [];
    }

    const schemes: Scheme[] = [];
    snapshot.forEach((doc) => {
      schemes.push({ id: doc.id, ...doc.data() } as Scheme);
    });
    return schemes;
  } catch (error) {
    console.error(`Error fetching schemes for user ${userId}:`, error);
    return [];
  }
}
