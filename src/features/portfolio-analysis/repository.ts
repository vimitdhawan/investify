/**
 * Portfolio Analysis Repository
 * Handles Firestore data fetching for holdings and schemes
 */
import { firestore } from '@/lib/firebase';

import type { Holdings } from './type';

/**
 * Fetch holdings data from Firestore by ISIN
 * @param isin - The ISIN identifier for the scheme
 * @returns Holdings data or null if not found
 */
export async function getHoldingsByIsin(isin: string): Promise<Holdings | null> {
  if (!isin || isin.trim() === '') {
    return null;
  }

  try {
    const holdingsDoc = await firestore.collection('holdings').doc(isin).get();

    if (!holdingsDoc.exists) {
      console.warn(`Holdings not found for ISIN: ${isin}`);
      return null;
    }

    return holdingsDoc.data() as Holdings;
  } catch (error) {
    console.error(`Error fetching holdings for ISIN ${isin}:`, error);
    return null;
  }
}

/**
 * Batch fetch holdings for multiple ISINs
 * @param isins - Array of ISIN identifiers
 * @returns Map of ISIN to Holdings data
 */
export async function batchGetHoldings(isins: string[]): Promise<Map<string, Holdings | null>> {
  const results = new Map<string, Holdings | null>();

  // Filter out empty/invalid ISINs
  const validIsins = isins.filter((isin) => isin && isin.trim() !== '');

  if (validIsins.length === 0) {
    return results;
  }

  try {
    // Fetch all holdings in parallel
    const holdingsPromises = validIsins.map((isin) => getHoldingsByIsin(isin));
    const holdingsData = await Promise.all(holdingsPromises);

    // Map results
    validIsins.forEach((isin, index) => {
      results.set(isin, holdingsData[index]);
    });

    return results;
  } catch (error) {
    console.error('Error batch fetching holdings:', error);
    return results;
  }
}
