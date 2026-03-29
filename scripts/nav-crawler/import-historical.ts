#!/usr/bin/env tsx
/**
 * One-time Historical NAV Import
 * Downloads historical NAV data from GitHub Parquet file and imports to Firestore
 */
import * as fs from 'fs';
import * as path from 'path';

import { AMFI_CONFIG } from './config';
import { fetchAmfiNav } from './fetch-nav';
import { bulkInitializeSchemeHistory, syncLatestNavToFirestore } from './sync-firestore';
import type { NavHistoryEntry } from './types';
import { formatTimestamp } from './utils';

async function downloadParquetFile(url: string, outputPath: string): Promise<void> {
  console.log(`[${formatTimestamp()}] Downloading parquet file from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  const fileSizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(`[${formatTimestamp()}] Downloaded ${fileSizeMB} MB to ${outputPath}`);
}

async function parseParquetFile(
  filePath: string
): Promise<Map<number, { schemeName: string; navHistory: NavHistoryEntry[] }>> {
  console.log(`[${formatTimestamp()}] Parsing parquet file...`);

  // Use hyparquet for reading parquet files
  const { parquetReadObjects, asyncBufferFromFile } = await import('hyparquet');
  const file = await asyncBufferFromFile(filePath);

  const rows = await parquetReadObjects({
    file,
    columns: ['Scheme_Code', 'Date', 'NAV'],
  });

  const schemeMap = new Map<number, { schemeName: string; navHistory: NavHistoryEntry[] }>();
  let recordCount = 0;

  for (const row of rows) {
    recordCount++;

    if (recordCount % 100000 === 0) {
      console.log(`[${formatTimestamp()}] Processed ${recordCount} records...`);
    }

    const schemeCode = row.Scheme_Code as unknown as number;
    const date = row.Date as unknown as string; // Format: YYYY-MM-DD
    const nav = String(row.NAV);

    if (!schemeMap.has(schemeCode)) {
      schemeMap.set(schemeCode, {
        schemeName: `Scheme ${schemeCode}`, // We'll update this with actual name later
        navHistory: [],
      });
    }

    const scheme = schemeMap.get(schemeCode)!;
    scheme.navHistory.push({ date, nav });
  }

  console.log(
    `[${formatTimestamp()}] Parsed ${recordCount} NAV records for ${schemeMap.size} schemes`
  );

  return schemeMap;
}

async function enrichWithSchemeNames(
  schemeMap: Map<number, { schemeName: string; navHistory: NavHistoryEntry[] }>
): Promise<void> {
  console.log(`[${formatTimestamp()}] Enriching with scheme names from AMFI...`);

  const navRecords = await fetchAmfiNav();

  let enrichedCount = 0;
  for (const record of navRecords) {
    const scheme = schemeMap.get(record.schemeCode);
    if (scheme) {
      scheme.schemeName = record.schemeName;
      enrichedCount++;
    }
  }

  console.log(`[${formatTimestamp()}] Enriched ${enrichedCount} schemes with names`);
}

async function main() {
  console.log(`[${formatTimestamp()}] ========================================`);
  console.log(`[${formatTimestamp()}] Starting Historical NAV Import`);
  console.log(`[${formatTimestamp()}] ========================================`);

  const tempDir = path.join(process.cwd(), 'temp');
  const parquetPath = path.join(tempDir, 'mutual_fund_nav_history.parquet');

  try {
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Download parquet file (if not already exists)
    if (!fs.existsSync(parquetPath)) {
      await downloadParquetFile(AMFI_CONFIG.GITHUB_PARQUET_URL, parquetPath);
    } else {
      console.log(`[${formatTimestamp()}] Using existing parquet file: ${parquetPath}`);
    }

    // Step 2: Parse parquet file
    const schemeMap = await parseParquetFile(parquetPath);

    // Step 3: Enrich with scheme names from AMFI
    await enrichWithSchemeNames(schemeMap);

    // Step 4: Bulk import to Firestore
    await bulkInitializeSchemeHistory(schemeMap);

    // Step 5: Sync latest NAV data
    console.log(`[${formatTimestamp()}] Syncing latest NAV data...`);
    const latestNavRecords = await fetchAmfiNav();
    await syncLatestNavToFirestore(latestNavRecords);

    console.log(`[${formatTimestamp()}] ========================================`);
    console.log(`[${formatTimestamp()}] Historical NAV Import completed successfully`);
    console.log(`[${formatTimestamp()}] ========================================`);
    console.log(`[${formatTimestamp()}] You can now delete the temp directory: ${tempDir}`);
  } catch (error: any) {
    console.error(`[${formatTimestamp()}] ========================================`);
    console.error(`[${formatTimestamp()}] Historical NAV Import failed`);
    console.error(`[${formatTimestamp()}] Error: ${error?.message || String(error)}`);
    console.error(`[${formatTimestamp()}] Stack:`, error?.stack || 'No stack trace');
    if (error instanceof Error) {
      console.error(`[${formatTimestamp()}] Full error:`, error);
    } else {
      console.error(`[${formatTimestamp()}] Full error object:`, error);
    }
    console.error(`[${formatTimestamp()}] ========================================`);
    process.exit(1);
  }
}

main();
