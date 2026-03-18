// scripts/ingest-holdings.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
  equity_alloc: string;
  bond_alloc: string;
  cash_alloc: string;
  other_alloc: string;
}

interface MarketCapWeightage {
  large_cap: number;
  mid_cap: number;
  small_cap: number;
  others_cap: number;
}

interface Concentration {
  number_of_holding: number;
  avg_market_cap: string;
  top_10_stk_wt: string;
  top_5_stk_wt: string;
  top_3_sector_wt: string;
}

interface StockHolding {
  name: string;
  sector: string;
  value: string;
  weighting: string;
}

interface MoneycontrolResponse {
  success: number;
  data: [
    {
      asset_alloc: AssetAllocation;
      market_cap_weightage: MarketCapWeightage;
      concentration: Concentration;
    },
    {
      stock_holding: StockHolding[];
    },
  ];
}

interface HoldingData {
  asset_alloc: AssetAllocation;
  market_cap_weightage: MarketCapWeightage;
  concentration: Concentration;
  stock_holding: StockHolding[];
}

interface SchemeGroup {
  schemeName: string;
  primaryIsin: string;
  allIsins: string[];
}

interface IngestOptions {
  mode: 'full' | 'test' | 'verify';
  limit?: number;
  dryRun?: boolean;
  verbose?: boolean;
  useLocalCsv?: boolean;
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

async function readSchemeFile(useLocalCsv: boolean = false): Promise<SchemeData[]> {
  const fileName = 'SchemeData.csv';

  try {
    if (useLocalCsv) {
      // Read from local file system
      const csvPath = path.join(process.cwd(), fileName);
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      return parseCSV(csvContent);
    } else {
      // Read from Firebase Storage
      const file = bucket.file(fileName);
      const [fileContent] = await file.download();
      return parseCSV(fileContent.toString('utf-8'));
    }
  } catch (error) {
    console.error('Error reading or parsing scheme data CSV:', error);
    if ((error as any).code === 404) {
      console.error(`File '${fileName}' not found.`);
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
// API Fetching
// ===========================

async function fetchHoldingsFromMoneycontrol(
  isin: string,
  verbose: boolean = false
): Promise<HoldingData | null> {
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

    if (response.data.success !== 1 || !response.data.data || response.data.data.length < 2) {
      console.warn(`No holdings data found for ISIN: ${isin}`);
      return null;
    }

    const [assetData, stockData] = response.data.data;

    if (verbose) {
      console.log(`    ✓ Holdings count: ${stockData.stock_holding?.length || 0}`);
      console.log(`    ✓ Equity allocation: ${assetData.asset_alloc.equity_alloc}%`);
    }

    return {
      asset_alloc: assetData.asset_alloc,
      market_cap_weightage: assetData.market_cap_weightage,
      concentration: assetData.concentration,
      stock_holding: stockData.stock_holding || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API error for ISIN ${isin}: ${error.message}`);
      if (error.response && verbose) {
        console.error(`Status: ${error.response.status}`);
      }
    } else {
      console.error(`Unexpected error for ISIN ${isin}:`, error);
    }
    return null;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===========================
// Firestore Saving
// ===========================

async function saveHoldingToFirestore(
  isin: string,
  holdings: HoldingData,
  dryRun: boolean = false,
  verbose: boolean = false
): Promise<void> {
  try {
    if (dryRun) {
      if (verbose) {
        console.log(`    [DRY RUN] Would save holdings for ISIN: ${isin}`);
        console.log(`      - ${holdings.stock_holding.length} stock holdings`);
        console.log(`      - Equity: ${holdings.asset_alloc.equity_alloc}%`);
      }
    } else {
      const holdingRef = firestore.collection('holdings').doc(isin);
      await holdingRef.set(holdings, { merge: true });
      if (verbose) {
        console.log(`    ✓ Saved holdings for ISIN: ${isin}`);
      }
    }
  } catch (error) {
    console.error(`Error saving holdings for ISIN ${isin}:`, error);
  }
}

// ===========================
// Main Ingestion Logic
// ===========================

async function ingestHoldings(options: IngestOptions) {
  const { mode, limit, dryRun = false, verbose = false, useLocalCsv = false } = options;

  if (mode === 'verify') {
    console.log('\n🚀 Holdings Ingestion Logic Verification\n');
    console.log('This will verify:');
    console.log('  1. CSV parsing and ISIN extraction');
    console.log('  2. Scheme grouping logic');
    console.log('  3. Moneycontrol API fetching');
    console.log('  4. Data structure validation\n');
  } else {
    console.log('Starting mutual fund holdings ingestion...\n');
  }

  console.log(`Reading scheme data from ${useLocalCsv ? 'local CSV' : 'Firebase Storage'}...`);
  const allSchemes = await readSchemeFile(useLocalCsv);

  if (!allSchemes || allSchemes.length === 0) {
    console.log('No scheme data found to ingest.');
    return;
  }

  console.log(`✓ Found ${allSchemes.length} schemes in CSV\n`);

  console.log('Grouping schemes by name to deduplicate portfolio fetching...');
  const schemeGroups = groupSchemesByName(allSchemes);
  console.log(`✓ Grouped into ${schemeGroups.length} unique scheme families\n`);

  // Determine how many groups to process
  let groupsToProcess = schemeGroups;
  if (limit && limit > 0) {
    groupsToProcess = schemeGroups.slice(0, limit);
    console.log(
      `${mode === 'verify' ? '🧪' : '⚠️'} Processing only first ${limit} groups${mode === 'test' || mode === 'verify' ? ' (test mode)' : ''}\n`
    );
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be saved to Firestore\n');
  }

  if (mode === 'verify') {
    console.log('='.repeat(60));
  }

  let processedGroups = 0;
  let successfulFetches = 0;
  let failedFetches = 0;
  let totalIsinsSaved = 0;

  for (const group of groupsToProcess) {
    processedGroups++;

    if (verbose || mode === 'verify') {
      console.log(
        `\n[${processedGroups}/${groupsToProcess.length}] ${mode === 'verify' ? group.schemeName : `Processing: ${group.schemeName}`}`
      );
      console.log(`  Primary ISIN: ${group.primaryIsin}`);
      console.log(
        `  Total ISINs${mode === 'verify' ? '' : ' in group'}: ${group.allIsins.length}${mode === 'verify' ? ` (${group.allIsins.join(', ')})` : ''}`
      );
    } else {
      console.log(`[${processedGroups}/${groupsToProcess.length}] Processing: ${group.schemeName}`);
    }

    // Fetch holdings for the primary ISIN
    const holdings = await fetchHoldingsFromMoneycontrol(
      group.primaryIsin,
      verbose || mode === 'verify'
    );

    if (holdings) {
      // Save for all ISINs in the group
      for (const isin of group.allIsins) {
        await saveHoldingToFirestore(isin, holdings, dryRun, verbose);
      }
      successfulFetches++;
      totalIsinsSaved += group.allIsins.length;

      if (mode === 'verify') {
        console.log(`  ✓ SUCCESS - Would save for ${group.allIsins.length} ISINs`);
        console.log(`\n  📊 Sample Data:`);
        console.log(`    Asset Allocation:`);
        console.log(`      - Equity: ${holdings.asset_alloc.equity_alloc}%`);
        console.log(`      - Bond: ${holdings.asset_alloc.bond_alloc}%`);
        console.log(`      - Cash: ${holdings.asset_alloc.cash_alloc}%`);
        console.log(`    Market Cap:`);
        console.log(`      - Large Cap: ${holdings.market_cap_weightage.large_cap || 'N/A'}%`);
        console.log(`      - Mid Cap: ${holdings.market_cap_weightage.mid_cap || 'N/A'}%`);
        console.log(`      - Small Cap: ${holdings.market_cap_weightage.small_cap || 'N/A'}%`);
        console.log(`    Holdings: ${holdings.stock_holding.length} stocks`);
        if (holdings.stock_holding.length > 0) {
          console.log(
            `    Top holding: ${holdings.stock_holding[0].name} (${holdings.stock_holding[0].weighting}%)`
          );
        }
      } else if (!verbose) {
        console.log(`  ✓ Saved holdings for ${group.allIsins.length} ISINs`);
      }
    } else {
      console.warn(`  ✗ Failed to fetch holdings for ${group.schemeName}`);
      failedFetches++;
    }

    // Rate limiting: delay between each scheme family
    if (processedGroups < groupsToProcess.length) {
      if (mode === 'verify') {
        console.log(`\n  ⏳ Waiting 500ms before next request...`);
      }
      await delay(500);
    }
  }

  // Summary
  if (mode === 'verify') {
    console.log('\n' + '='.repeat(60));
  }

  console.log(
    '\n' + (mode === 'verify' ? '📊 VERIFICATION SUMMARY' : '=== Ingestion Complete ===')
  );
  console.log(
    `${mode === 'verify' ? '  Total tested' : 'Total scheme families processed'}: ${processedGroups}${limit ? `/${schemeGroups.length}` : ''}`
  );
  console.log(
    `${mode === 'verify' ? '  Successful' : 'Successful fetches'}: ${successfulFetches} ✓`
  );
  console.log(`${mode === 'verify' ? '  Failed' : 'Failed fetches'}: ${failedFetches} ✗`);
  console.log(
    `${mode === 'verify' ? '  Success rate' : 'Total ISINs processed'}: ${mode === 'verify' ? `${((successfulFetches / processedGroups) * 100).toFixed(1)}%` : totalIsinsSaved}`
  );

  if (mode === 'verify' && limit) {
    const totalIsins = schemeGroups.reduce((sum, g) => sum + g.allIsins.length, 0);
    console.log(
      `\n💡 If successful, this script will save holdings for ALL ${schemeGroups.length} scheme families`
    );
    console.log(`   across approximately ${totalIsins} ISINs`);
  }

  if (mode !== 'verify') {
    console.log('\nHoldings ingestion finished.');
  } else {
    console.log('\n✅ Verification complete!\n');
  }
}

// ===========================
// CLI Entry Point
// ===========================

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const mode = args.includes('--verify') ? 'verify' : args.includes('--test') ? 'test' : 'full';
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const useLocalCsv = args.includes('--local');

  // Parse limit
  let limit: number | undefined;
  const limitIndex = args.findIndex((arg) => arg === '--limit' || arg === '-l');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    limit = parseInt(args[limitIndex + 1], 10);
  } else if (mode === 'test') {
    limit = 5; // Default for test mode
  } else if (mode === 'verify') {
    limit = 3; // Default for verify mode
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run ingest:holdings [options]

Modes:
  --verify          Verification mode (tests 3 groups, shows detailed output)
  --test            Test mode (processes 5 groups with dry-run)
  (default)         Full mode (processes all schemes)

Options:
  --dry-run         Don't save to Firestore (only fetch and log)
  --verbose, -v     Show detailed logging
  --local           Read CSV from local file instead of Firebase Storage
  --limit, -l <n>   Limit number of scheme groups to process
  --help, -h        Show this help message

Examples:
  npm run ingest:holdings                    # Full ingestion
  npm run ingest:holdings -- --test          # Test with 5 groups
  npm run ingest:holdings -- --verify        # Verify with 3 groups
  npm run ingest:holdings -- --limit 10      # Process only 10 groups
  npm run ingest:holdings -- --dry-run -v    # Dry run with verbose output
  npm run ingest:holdings -- --local --test  # Test using local CSV
`);
    return;
  }

  const options: IngestOptions = {
    mode,
    limit,
    dryRun: dryRun || mode === 'test' || mode === 'verify',
    verbose: verbose || mode === 'verify',
    useLocalCsv,
  };

  await ingestHoldings(options);
}

main().catch((error) => {
  console.error('An error occurred during holdings ingestion:', error);
  process.exit(1);
});
