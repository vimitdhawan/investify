#!/usr/bin/env tsx
/**
 * Daily NAV Crawler
 * Fetches latest NAV data from AMFI and updates Firestore
 */
import { fetchAmfiNav } from './fetch-nav';
import { syncLatestNavToFirestore } from './sync-firestore';
import { formatTimestamp } from './utils';

async function main() {
  console.log(`[${formatTimestamp()}] ========================================`);
  console.log(`[${formatTimestamp()}] Starting Daily NAV Crawler`);
  console.log(`[${formatTimestamp()}] ========================================`);

  try {
    // Step 1: Fetch latest NAV data from AMFI
    const navRecords = await fetchAmfiNav();

    if (navRecords.length === 0) {
      console.error(`[${formatTimestamp()}] No NAV records found. Exiting.`);
      process.exit(1);
    }

    // Step 2: Sync to Firestore
    await syncLatestNavToFirestore(navRecords);

    console.log(`[${formatTimestamp()}] ========================================`);
    console.log(`[${formatTimestamp()}] Daily NAV Crawler completed successfully`);
    console.log(`[${formatTimestamp()}] ========================================`);
  } catch (error: any) {
    console.error(`[${formatTimestamp()}] ========================================`);
    console.error(`[${formatTimestamp()}] Daily NAV Crawler failed`);
    console.error(`[${formatTimestamp()}] Error: ${error.message}`);
    console.error(`[${formatTimestamp()}] Stack:`, error.stack);
    console.error(`[${formatTimestamp()}] ========================================`);
    process.exit(1);
  }
}

main();
