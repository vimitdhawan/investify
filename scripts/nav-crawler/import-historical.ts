#!/usr/bin/env tsx
/**
 * One-time Historical NAV Import
 * Downloads historical NAV data from GitHub Parquet file and imports to Firestore
 */
import * as fs from 'fs';
import * as path from 'path';

import { AMFI_CONFIG } from './config';
import { bulkInitializeSchemeHistory } from './sync-firestore';
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

async function parseAndImportParquetFile(filePath: string): Promise<void> {
  console.log(`[${formatTimestamp()}] Parsing and importing parquet file...`);

  // Use hyparquet for reading parquet files
  const { parquetReadObjects, asyncBufferFromFile } = await import('hyparquet');
  const file = await asyncBufferFromFile(filePath);

  const rows = await parquetReadObjects({
    file,
    columns: ['Scheme_Code', 'Date', 'NAV'],
  });

  // Process in chunks to avoid memory and payload size issues
  // Firestore has a 10MB payload limit per batch
  const CHUNK_SIZE = 10; // Process 10 schemes at a time (smaller to stay under 10MB limit)
  const schemeMap = new Map<number, { schemeName: string; navHistory: NavHistoryEntry[] }>();
  let recordCount = 0;
  let importedSchemes = 0;

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
        schemeName: `Scheme ${schemeCode}`,
        navHistory: [],
      });
    }

    const scheme = schemeMap.get(schemeCode)!;
    scheme.navHistory.push({ date, nav });

    // When we have accumulated CHUNK_SIZE schemes, import them
    if (schemeMap.size >= CHUNK_SIZE) {
      await bulkInitializeSchemeHistory(schemeMap);
      importedSchemes += schemeMap.size;
      console.log(
        `[${formatTimestamp()}] Imported ${importedSchemes} schemes (${schemeMap.size} in this batch)`
      );
      schemeMap.clear();
    }
  }

  // Import remaining schemes
  if (schemeMap.size > 0) {
    await bulkInitializeSchemeHistory(schemeMap);
    importedSchemes += schemeMap.size;
    console.log(
      `[${formatTimestamp()}] Imported ${importedSchemes} schemes (${schemeMap.size} in final batch)`
    );
  }

  console.log(
    `[${formatTimestamp()}] Parsed ${recordCount} NAV records for ${importedSchemes} total schemes`
  );
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

    // Step 2: Parse and import parquet file (processes in chunks to avoid memory issues)
    await parseAndImportParquetFile(parquetPath);

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
