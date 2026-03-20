// scripts/ingest-holdings.ts
import axios from 'axios';

import { bucket, firestore } from '@/lib/firebase';

// ===========================
// Types and Interfaces
// ===========================

interface SchemeData {
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

interface AssetAllocation {
  equityAlloc: number;
  bondAlloc: number;
  cashAlloc: number;
  otherAlloc: number;
}

interface MarketCapWeightage {
  largeCap: number;
  midCap: number;
  smallCap: number;
  othersCap: number;
}

interface Concentration {
  numberOfHolding: number;
  avgMarketCap: string;
  top10SectorWeight: number;
  top5SectorWeight: number;
  top3SectorWeight: number;
}

interface StockHolding {
  name: string;
  sector: string;
  value: number;
  weighting: number;
}

// Raw response from MoneyControl API (before type conversion)
interface MoneycontrolAssetAllocation {
  equity_alloc: string;
  bond_alloc: string;
  cash_alloc: string;
  other_alloc: string;
}

interface MoneycontrolConcentration {
  number_of_holding: number;
  avg_market_cap: string;
  top_10_stk_wt: string;
  top_5_stk_wt: string;
  top_3_sector_wt: string;
}

interface MoneyControlMarketCapWeightage {
  large_cap: number;
  mid_cap: number;
  small_cap: number;
  others_cap: number;
}

interface MoneycontrolStockHolding {
  name: string;
  sector: string;
  value: string;
  weighting: string;
}

interface MoneycontrolResponse {
  success: number;
  data: [
    {
      asset_alloc: MoneycontrolAssetAllocation;
      market_cap_weightage: MoneyControlMarketCapWeightage;
      concentration: MoneycontrolConcentration;
    },
    {
      stock_holding: MoneycontrolStockHolding[];
    },
  ];
}

interface SchemeHolding {
  isin: string;
  assetAlloc: AssetAllocation;
  marketCapWeightage: MarketCapWeightage;
  concentration: Concentration;
  stockHolding: StockHolding[];
  fetchedAt: string;
}

interface SchemeGroup {
  schemeName: string;
  primaryIsin: string;
  allIsins: string[];
}

interface IngestOptions {
  dryRun?: boolean;
  verbose?: boolean;
  recordsLimit?: number;
  workerCount?: number;
}

// ===========================
// CSV Parsing
// ===========================

function parseCSV(csvContent: string): SchemeData[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  // Handle merged header from CSV
  if (headers.length === 10) {
    headers.push('ISIN Div Reinvestment');
    headers[9] = 'ISIN Div Payout/ ISIN Growth';
  }

  const data: SchemeData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(',');
    if (values.length < headers.length - 1) continue;

    const scheme: SchemeData = {
      amc: values[0] || '',
      code: values[1] || '',
      schemeName: values[2] || '',
      schemeType: values[3] || '',
      schemeCategory: values[4] || '',
      schemeNavName: values[5] || '',
      schemeMinimumAmount: values[6] || '',
      launchDate: values[7] || '',
      closureDate: values[8] || '',
      isinDivPayoutOrGrowth: (values[9] || '').trim(),
      isinDivReinvestment: (values[10] || '').trim(),
    };
    data.push(scheme);
  }
  return data;
}

async function readSchemeFile(): Promise<SchemeData[]> {
  const fileName = 'SchemeData.csv';

  try {
    // Always read from Firebase Storage
    const file = bucket.file(fileName);
    const [fileContent] = await file.download();
    return parseCSV(fileContent.toString('utf-8'));
  } catch (error) {
    console.error('Error reading or parsing scheme data CSV:', error);
    if ((error as any).code === 404) {
      console.error(`File '${fileName}' not found in Firebase Storage.`);
    }
    return [];
  }
}

// ===========================
// ISIN Extraction & Grouping
// ===========================

function extractIsins(isinString: string): string[] {
  // Regex to match ISINs (12 characters starting with INF)
  const isinRegex = /INF[A-Z0-9]{9}/g;
  const matches = isinString.match(isinRegex);
  return matches || [];
}

function groupSchemesByName(schemes: SchemeData[]): SchemeGroup[] {
  const groupMap = new Map<string, SchemeGroup>();

  for (const scheme of schemes) {
    const schemeName = scheme.schemeName;
    if (!schemeName) continue;

    // Extract all ISINs from both columns
    const isinsFromPayout = extractIsins(scheme.isinDivPayoutOrGrowth);
    const isinsFromReinvest = extractIsins(scheme.isinDivReinvestment);
    const allIsins = [...isinsFromPayout, ...isinsFromReinvest];

    if (allIsins.length === 0) continue;

    if (!groupMap.has(schemeName)) {
      groupMap.set(schemeName, {
        schemeName,
        primaryIsin: allIsins[0],
        allIsins: allIsins,
      });
    } else {
      const existing = groupMap.get(schemeName)!;
      existing.allIsins.push(...allIsins);
    }
  }

  // Deduplicate ISINs in each group
  for (const group of groupMap.values()) {
    group.allIsins = [...new Set(group.allIsins)];
  }

  return Array.from(groupMap.values());
}

// ===========================
// Type Conversion Helpers
// ===========================

/**
 * Safely converts any value to number, returns 0 if invalid/undefined/null
 */
function toSafeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Converts MoneyControl asset allocation to typed version
 */
function convertAssetAllocation(raw: MoneycontrolAssetAllocation): AssetAllocation {
  return {
    equityAlloc: toSafeNumber(raw?.equity_alloc),
    bondAlloc: toSafeNumber(raw?.bond_alloc),
    cashAlloc: toSafeNumber(raw?.cash_alloc),
    otherAlloc: toSafeNumber(raw?.other_alloc),
  };
}

/**
 * Converts MoneyControl concentration to typed version
 */
function convertConcentration(raw: MoneycontrolConcentration): Concentration {
  return {
    numberOfHolding: toSafeNumber(raw?.number_of_holding),
    avgMarketCap: raw?.avg_market_cap || '0',
    top10SectorWeight: toSafeNumber(raw?.top_10_stk_wt),
    top5SectorWeight: toSafeNumber(raw?.top_5_stk_wt),
    top3SectorWeight: toSafeNumber(raw?.top_3_sector_wt),
  };
}

/**
 * Converts MoneyControl stock holding to typed version
 */
function convertStockHolding(raw: MoneycontrolStockHolding): StockHolding {
  return {
    name: raw?.name || 'Unknown',
    sector: raw?.sector || 'Others',
    value: toSafeNumber(raw?.value),
    weighting: toSafeNumber(raw?.weighting),
  };
}

function convertMarketCapWeightage(raw: MoneyControlMarketCapWeightage): MarketCapWeightage {
  return {
    largeCap: toSafeNumber(raw?.large_cap),
    midCap: toSafeNumber(raw?.mid_cap),
    smallCap: toSafeNumber(raw?.small_cap),
    othersCap: toSafeNumber(raw?.others_cap),
  };
}

// ===========================
// Deduplication
// ===========================

/**
 * Deduplicates stock holdings by name + sector combination
 * Keeps the first occurrence if duplicates exist
 */
function deduplicateStockHoldings(stockHoldings: StockHolding[]): StockHolding[] {
  const seen = new Set<string>();
  const unique: StockHolding[] = [];

  for (const holding of stockHoldings) {
    // Create unique key from name + sector
    const key = `${holding.name.trim()}|${holding.sector.trim()}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(holding);
    }
  }

  return unique;
}

// ===========================
// API Fetching
// ===========================

async function fetchHoldingsFromMoneycontrol(
  isin: string,
  verbose: boolean = false
): Promise<SchemeHolding | null> {
  const apiUrl = `https://api.moneycontrol.com/swiftapi/v1/mutualfunds/portfolio?isin=${isin}&deviceType=W&responseType=json`;

  try {
    if (verbose) {
      console.log(`    Fetching from: ${apiUrl}`);
    }

    const response = await axios.get<MoneycontrolResponse>(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (verbose) {
      console.log(`    Response status: ${response.status}`);
    }

    // Validation: Check success flag
    if (response.data.success !== 1) {
      console.warn(`API returned success=0 for ISIN: ${isin}`);
      return null;
    }

    // Validate data structure
    if (
      !response.data.data ||
      !Array.isArray(response.data.data) ||
      response.data.data.length < 2
    ) {
      console.warn(`No holdings data found for ISIN: ${isin}`);
      return null;
    }

    // Safe extraction from tuple array
    const assetData = response.data.data[0];
    const stockData = response.data.data[1];

    // Validate extracted data has required fields
    if (!assetData?.asset_alloc) {
      console.warn(`Missing asset_alloc in response for ISIN: ${isin}`);
      return null;
    }

    if (!stockData?.stock_holding || !Array.isArray(stockData.stock_holding)) {
      console.warn(`Missing or invalid stock_holding in response for ISIN: ${isin}`);
      return null;
    }

    // Convert types from raw MoneyControl response
    const convertedAssetAlloc = convertAssetAllocation(assetData.asset_alloc);
    const convertedConcentration = convertConcentration(assetData.concentration);
    const convertedStockHoldings = stockData.stock_holding.map(convertStockHolding);
    const convertedMarketCapWeightage = convertMarketCapWeightage(assetData.market_cap_weightage);

    // Deduplicate stocks by name + sector
    const uniqueStockHoldings = deduplicateStockHoldings(convertedStockHoldings);

    if (verbose) {
      const dedupCount = convertedStockHoldings.length - uniqueStockHoldings.length;
      console.log(
        `    ✓ Holdings count: ${uniqueStockHoldings.length}${dedupCount > 0 ? ` (removed ${dedupCount} duplicates)` : ''}`
      );
      console.log(`    ✓ Equity allocation: ${convertedAssetAlloc.equityAlloc}%`);
    }

    // Map to SchemeHolding
    const schemeHolding: SchemeHolding = {
      isin,
      assetAlloc: convertedAssetAlloc,
      marketCapWeightage: convertedMarketCapWeightage,
      concentration: convertedConcentration,
      stockHolding: uniqueStockHoldings,
      fetchedAt: new Date().toISOString(),
    };

    return schemeHolding;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API error for ISIN ${isin}: ${error.message}`);
      if (error.response && verbose) {
        console.error(`Status: ${error.response.status}`);
      }
    } else {
      console.error(`Unexpected error for ISIN ${isin}:`, error);
    }
    throw error; // Throw to allow retry logic to catch
  }
}

/**
 * Fetches holdings with exponential backoff retry logic
 * Retries up to maxRetries times with increasing delays
 */
async function fetchHoldingsWithRetry(
  isin: string,
  maxRetries: number = 2,
  verbose: boolean = false
): Promise<SchemeHolding | null> {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const holding = await fetchHoldingsFromMoneycontrol(isin, verbose);

      // Successfully fetched and validated
      if (holding !== null) {
        return holding;
      }

      // If holding is null (validation failed), don't retry
      return null;
    } catch (error) {
      if (attempt <= maxRetries) {
        // Exponential backoff: 1s, 2s
        const delayMs = 1000 * attempt;
        if (verbose) {
          console.warn(
            `  ⚠️  Attempt ${attempt}/${maxRetries + 1} failed for ISIN ${isin}. Retrying in ${delayMs}ms...`
          );
        }
        await delay(delayMs);
      } else {
        // All retries exhausted
        if (verbose) {
          console.error(
            `  ✗ Failed to fetch after ${maxRetries + 1} attempts for ISIN ${isin}`,
            error
          );
        }
        return null;
      }
    }
  }

  return null;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===========================
// Firestore Saving
// ===========================

async function saveHoldingToFirestore(
  isin: string,
  holding: SchemeHolding,
  dryRun: boolean = false,
  verbose: boolean = false
): Promise<void> {
  try {
    if (dryRun) {
      if (verbose) {
        console.log(`    [DRY RUN] Would save SchemeHolding for ISIN: ${isin}`);
        console.log(`      - ${holding.stockHolding.length} stock holdings`);
        console.log(`      - Equity: ${holding.assetAlloc.equityAlloc}%`);
      }
    } else {
      const holdingRef = firestore.collection('holdings').doc(isin);
      await holdingRef.set(holding, { merge: true });
      if (verbose) {
        console.log(`    ✓ Saved SchemeHolding for ISIN: ${isin}`);
      }
    }
  } catch (error) {
    console.error(`Error saving holdings for ISIN ${isin}:`, error);
  }
}

// ===========================
// Parallel Processing
// ===========================

/**
 * Processes scheme groups in parallel using a worker pool
 * Each worker fetches and saves holdings independently
 */
async function processGroupsInParallel(
  groups: SchemeGroup[],
  workerCount: number,
  dryRun: boolean,
  verbose: boolean
): Promise<{
  successCount: number;
  failureCount: number;
  totalIsins: number;
}> {
  let successCount = 0;
  let failureCount = 0;
  let totalIsins = 0;
  let currentIndex = 0;

  if (verbose) {
    console.log(`Starting parallel processing with ${workerCount} workers...\n`);
  }

  /**
   * Worker function: processes one group at a time until queue is empty
   */
  const worker = async (workerId: number) => {
    while (currentIndex < groups.length) {
      const index = currentIndex++;
      const group = groups[index];

      if (verbose) {
        console.log(
          `[Worker ${workerId}] [${index + 1}/${groups.length}] Processing: ${group.schemeName}`
        );
      } else {
        console.log(`[${index + 1}/${groups.length}] Processing: ${group.schemeName}`);
      }

      // Fetch holdings for primary ISIN (with retry)
      const holdings = await fetchHoldingsWithRetry(group.primaryIsin, 2, verbose);

      if (holdings) {
        // Save for all ISINs in the group
        for (const isin of group.allIsins) {
          await saveHoldingToFirestore(isin, holdings, dryRun, verbose);
        }
        successCount++;
        totalIsins += group.allIsins.length;

        if (!verbose) {
          console.log(`  ✓ Saved holdings for ${group.allIsins.length} ISINs`);
        }
      } else {
        failureCount++;
        console.warn(`  ✗ Failed to fetch holdings for ${group.schemeName}`);
      }
    }
  };

  // Launch N workers in parallel
  const workers = Array(workerCount)
    .fill(null)
    .map((_, i) => worker(i + 1));

  await Promise.all(workers);

  return { successCount, failureCount, totalIsins };
}

// ===========================
// Main Ingestion Logic
// ===========================

async function ingestHoldings(options: IngestOptions) {
  const { dryRun = false, verbose = false, recordsLimit, workerCount = 20 } = options;

  console.log('Starting mutual fund holdings ingestion...\n');

  // Always read from Firebase Storage
  console.log('Reading scheme data from Firebase Storage...');
  const allSchemes = await readSchemeFile();

  if (!allSchemes || allSchemes.length === 0) {
    console.log('No scheme data found to ingest.');
    return;
  }

  console.log(`✓ Found ${allSchemes.length} schemes in CSV\n`);

  // Group schemes by name
  console.log('Grouping schemes by name to deduplicate portfolio fetching...');
  const schemeGroups = groupSchemesByName(allSchemes);
  console.log(`✓ Grouped into ${schemeGroups.length} unique scheme families\n`);

  // Apply record limit
  let groupsToProcess = schemeGroups;
  if (recordsLimit && recordsLimit > 0) {
    groupsToProcess = schemeGroups.slice(0, recordsLimit);
    console.log(`⚠️  Processing only first ${recordsLimit} groups\n`);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be saved to Firestore\n');
  }

  // Process groups in parallel
  const results = await processGroupsInParallel(groupsToProcess, workerCount, dryRun, verbose);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('=== Ingestion Complete ===');
  console.log(
    `Total processed: ${results.successCount + results.failureCount}/${groupsToProcess.length}`
  );
  console.log(`Successful: ${results.successCount} ✓`);
  console.log(`Failed: ${results.failureCount} ✗`);
  console.log(`Total ISINs processed: ${results.totalIsins}`);
  console.log('='.repeat(60));
  console.log('\nHoldings ingestion finished.');
}

// ===========================
// CLI Entry Point
// ===========================

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');

  // Parse --records <n>
  let recordsLimit: number | undefined;
  const recordsIdx = args.findIndex((a) => a === '--records');
  if (recordsIdx !== -1 && args[recordsIdx + 1]) {
    recordsLimit = parseInt(args[recordsIdx + 1], 10);
    if (isNaN(recordsLimit)) {
      console.error('Error: --records value must be a number');
      process.exit(1);
    }
  }

  // Parse --workers <n>
  let workerCount = 5; // default
  const workersIdx = args.findIndex((a) => a === '--workers');
  if (workersIdx !== -1 && args[workersIdx + 1]) {
    workerCount = parseInt(args[workersIdx + 1], 10);
    if (isNaN(workerCount) || workerCount < 1) {
      console.error('Error: --workers value must be a positive number');
      process.exit(1);
    }
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run ingest:holdings [options]

Options:
  --dry-run              Don't save to Firestore (test mode)
  --verbose, -v          Show detailed logging
  --records <n>          Limit number of scheme groups to process
  --workers <n>          Number of parallel workers (default: 5)
  --help, -h             Show this help message

Examples:
  npm run ingest:holdings                              # Process all schemes
  npm run ingest:holdings -- --dry-run                 # Dry run mode
  npm run ingest:holdings -- --records 50              # Limit to 50 groups
  npm run ingest:holdings -- --workers 10              # Use 10 parallel workers
  npm run ingest:holdings -- --records 50 --workers 10 # Combined options
  npm run ingest:holdings -- --dry-run --verbose       # Dry run with detailed logs
  npm run ingest:holdings -- --records 10 -v           # 10 groups with verbose output
`);
    return;
  }

  await ingestHoldings({
    dryRun,
    verbose,
    recordsLimit,
    workerCount,
  });
}

main().catch((error) => {
  console.error('An error occurred during holdings ingestion:', error);
  process.exit(1);
});
