/**
 * Sync NAV data to Firestore
 */
import { FieldValue } from 'firebase-admin/firestore';

import { firestore } from '@/lib/firebase';

import { FIRESTORE_CONFIG } from './config';
import type { NavHistoryEntry, ParsedNavLine } from './types';
import { ProgressLogger, chunk, formatTimestamp } from './utils';

/**
 * Sync latest NAV data to Firestore
 * Updates mf_schemes_latest collection and appends to mf_schemes_history
 */
export async function syncLatestNavToFirestore(records: ParsedNavLine[]): Promise<void> {
  console.log(`[${formatTimestamp()}] Syncing ${records.length} records to Firestore...`);

  // First, check which schemes need updates (skip if navDate is same)
  const recordsToUpdate: ParsedNavLine[] = [];
  const progressCheck = new ProgressLogger(records.length, 'Checking for updates');

  for (const record of records) {
    const existingDoc = await firestore
      .collection(FIRESTORE_CONFIG.COLLECTION_LATEST)
      .doc(record.schemeCode.toString())
      .get();

    const existingDate = existingDoc.data()?.navDate;

    // Skip if date is same (no new data)
    if (existingDate === record.navDate) {
      progressCheck.increment();
      continue;
    }

    recordsToUpdate.push(record);
    progressCheck.increment();
  }

  progressCheck.finish();

  if (recordsToUpdate.length === 0) {
    console.log(`[${formatTimestamp()}] No new NAV data to update. All schemes are up to date.`);
    return;
  }

  console.log(`[${formatTimestamp()}] Found ${recordsToUpdate.length} schemes with new NAV data`);

  // Batch update mf_schemes_latest and mf_schemes_history
  const batches = chunk(recordsToUpdate, FIRESTORE_CONFIG.BATCH_SIZE);
  const progress = new ProgressLogger(recordsToUpdate.length, 'Updating Firestore');

  for (const batchRecords of batches) {
    const batch = firestore.batch();

    for (const record of batchRecords) {
      const schemeCodeStr = record.schemeCode.toString();

      // Update mf_schemes_latest
      const latestRef = firestore.collection(FIRESTORE_CONFIG.COLLECTION_LATEST).doc(schemeCodeStr);

      batch.set(
        latestRef,
        {
          schemeCode: record.schemeCode,
          schemeName: record.schemeName,
          isinGrowth: record.isinGrowth,
          isinDivReinvestment: record.isinDivReinvestment,
          nav: record.nav,
          navDate: record.navDate,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Update mf_schemes_history (append to array)
      const historyRef = firestore
        .collection(FIRESTORE_CONFIG.COLLECTION_HISTORY)
        .doc(schemeCodeStr);

      const navEntry: NavHistoryEntry = {
        date: record.navDate,
        nav: record.nav,
      };

      batch.set(
        historyRef,
        {
          schemeCode: record.schemeCode,
          schemeName: record.schemeName,
          navHistory: FieldValue.arrayUnion(navEntry),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Update ISIN map for growth
      if (record.isinGrowth) {
        const isinGrowthRef = firestore
          .collection(FIRESTORE_CONFIG.COLLECTION_ISIN_MAP)
          .doc(record.isinGrowth);

        batch.set(isinGrowthRef, {
          isin: record.isinGrowth,
          schemeCode: record.schemeCode,
          schemeName: record.schemeName,
        });
      }

      // Update ISIN map for dividend reinvestment
      if (record.isinDivReinvestment) {
        const isinDivRef = firestore
          .collection(FIRESTORE_CONFIG.COLLECTION_ISIN_MAP)
          .doc(record.isinDivReinvestment);

        batch.set(isinDivRef, {
          isin: record.isinDivReinvestment,
          schemeCode: record.schemeCode,
          schemeName: record.schemeName,
        });
      }
    }

    await batch.commit();
    progress.increment(batchRecords.length);
  }

  progress.finish();
  console.log(
    `[${formatTimestamp()}] Successfully synced ${recordsToUpdate.length} schemes to Firestore`
  );
}

/**
 * Initialize scheme with historical data
 * Used for bulk import from parquet file
 */
export async function initializeSchemeHistory(
  schemeCode: number,
  schemeName: string,
  navHistory: NavHistoryEntry[]
): Promise<void> {
  const schemeCodeStr = schemeCode.toString();

  // Create/update history document
  await firestore.collection(FIRESTORE_CONFIG.COLLECTION_HISTORY).doc(schemeCodeStr).set({
    schemeCode,
    schemeName,
    navHistory,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Bulk initialize schemes with historical data
 */
export async function bulkInitializeSchemeHistory(
  schemes: Map<number, { schemeName: string; navHistory: NavHistoryEntry[] }>
): Promise<void> {
  const schemeEntries = Array.from(schemes.entries());
  console.log(
    `[${formatTimestamp()}] Initializing ${schemeEntries.length} schemes with historical data...`
  );

  const batches = chunk(schemeEntries, FIRESTORE_CONFIG.BATCH_SIZE);
  const progress = new ProgressLogger(schemeEntries.length, 'Bulk importing history');

  for (const batchEntries of batches) {
    const batch = firestore.batch();

    for (const [schemeCode, data] of batchEntries) {
      const schemeCodeStr = schemeCode.toString();
      const historyRef = firestore
        .collection(FIRESTORE_CONFIG.COLLECTION_HISTORY)
        .doc(schemeCodeStr);

      batch.set(historyRef, {
        schemeCode,
        schemeName: data.schemeName,
        navHistory: data.navHistory,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    progress.increment(batchEntries.length);
  }

  progress.finish();
  console.log(`[${formatTimestamp()}] Successfully initialized ${schemeEntries.length} schemes`);
}
