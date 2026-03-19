/**
 * Portfolio Analysis Service
 * Core business logic for aggregating and analyzing portfolio holdings
 */
import { batchGetHoldings } from './repository';
import type {
  AggregatedSector,
  AggregatedStock,
  AnalysisSummary,
  OverlapMatrix,
  PortfolioAnalysis,
  PortfolioScheme,
  SchemeMetadata,
  SchemeWithHoldings,
  WeightedSector,
  WeightedStock,
} from './type';

/**
 * Main function to generate complete portfolio analysis
 * @param schemes - User's portfolio schemes
 * @returns Complete portfolio analysis with top stocks, sectors, and overlap matrix
 */
export async function analyzePortfolio(schemes: PortfolioScheme[]): Promise<PortfolioAnalysis> {
  // Fetch holdings for all schemes
  const schemesWithHoldings = await matchSchemesWithHoldings(schemes);

  // Calculate total portfolio value
  const totalPortfolioValue = schemes.reduce((sum, s) => sum + s.marketValue, 0);

  // Aggregate stocks across all schemes
  const aggregatedStocks = aggregateStocks(schemesWithHoldings, totalPortfolioValue);

  // Calculate top 5 stocks
  const topStocks = calculateTopStocks(aggregatedStocks, 5);

  // Calculate top 5 sectors
  const topSectors = calculateTopSectors(aggregatedStocks, 5);

  // Calculate overlap matrix
  const overlapMatrix = calculateOverlapMatrix(schemesWithHoldings);

  // Generate summary
  const summary = generateSummary(schemesWithHoldings, aggregatedStocks, overlapMatrix);

  return {
    topStocks,
    topSectors,
    overlapMatrix,
    summary,
  };
}

/**
 * Match schemes with their holdings data from Firestore
 * @param schemes - Portfolio schemes
 * @returns Schemes paired with their holdings data
 */
export async function matchSchemesWithHoldings(
  schemes: PortfolioScheme[]
): Promise<SchemeWithHoldings[]> {
  // Extract unique ISINs
  const isins = schemes.map((s) => s.isin);

  // Batch fetch holdings
  const holdingsMap = await batchGetHoldings(isins);

  // Pair schemes with holdings
  return schemes.map((scheme) => ({
    scheme,
    holdings: holdingsMap.get(scheme.isin) ?? null,
  }));
}

/**
 * Aggregate stock holdings across all schemes with proper weighting
 * @param schemesWithHoldings - Schemes with their holdings
 * @param totalPortfolioValue - Total market value of portfolio
 * @returns Map of aggregated stocks with weighted percentages
 */
export function aggregateStocks(
  schemesWithHoldings: SchemeWithHoldings[],
  totalPortfolioValue: number
): Map<string, WeightedStock> {
  const stocksMap = new Map<string, WeightedStock>();

  if (totalPortfolioValue === 0) {
    return stocksMap;
  }

  for (const { scheme, holdings } of schemesWithHoldings) {
    if (!holdings || !holdings.stock_holding || holdings.stock_holding.length === 0) {
      continue;
    }

    // Calculate scheme's weight in portfolio
    const schemeWeight = scheme.marketValue / totalPortfolioValue;

    // Process each stock holding
    for (const stock of holdings.stock_holding) {
      const stockName = stock.name;
      const stockPercentageInScheme = parseFloat(stock.weighting) || 0;
      const stockSector = stock.sector || 'Unknown';

      // Calculate weighted percentage
      const weightedPercentage = (stockPercentageInScheme / 100) * schemeWeight * 100;

      // Aggregate
      const existing = stocksMap.get(stockName);
      if (existing) {
        existing.weight += weightedPercentage;
        existing.schemes.add(scheme.name);
      } else {
        stocksMap.set(stockName, {
          name: stockName,
          sector: stockSector,
          weight: weightedPercentage,
          schemes: new Set([scheme.name]),
        });
      }
    }
  }

  return stocksMap;
}

/**
 * Calculate top N stocks by weighted percentage
 * @param aggregatedStocks - Map of aggregated stocks
 * @param topN - Number of top stocks to return
 * @returns Array of top stocks sorted by weight
 */
export function calculateTopStocks(
  aggregatedStocks: Map<string, WeightedStock>,
  topN: number = 5
): AggregatedStock[] {
  const stocksArray = Array.from(aggregatedStocks.values());

  return stocksArray
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topN)
    .map((stock) => ({
      name: stock.name,
      sector: stock.sector,
      weightedPercentage: stock.weight,
      appearsInSchemes: Array.from(stock.schemes),
      rawValue: stock.weight,
    }));
}

/**
 * Group stocks by sector and calculate top N sectors
 * @param aggregatedStocks - Map of aggregated stocks
 * @param topN - Number of top sectors to return
 * @returns Array of top sectors sorted by weight
 */
export function calculateTopSectors(
  aggregatedStocks: Map<string, WeightedStock>,
  topN: number = 5
): AggregatedSector[] {
  const sectorsMap = new Map<string, WeightedSector>();

  // Group by sector
  for (const stock of aggregatedStocks.values()) {
    const sectorName = stock.sector || 'Unknown';
    const existing = sectorsMap.get(sectorName);

    if (existing) {
      existing.weight += stock.weight;
      existing.stocks.add(stock.name);
    } else {
      sectorsMap.set(sectorName, {
        name: sectorName,
        weight: stock.weight,
        stocks: new Set([stock.name]),
      });
    }
  }

  // Convert to array and sort
  const sectorsArray = Array.from(sectorsMap.values());

  return sectorsArray
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topN)
    .map((sector) => ({
      name: sector.name,
      weightedPercentage: sector.weight,
      stockCount: sector.stocks.size,
      stocks: Array.from(sector.stocks),
    }));
}

/**
 * Calculate pairwise overlap matrix for all schemes
 * @param schemesWithHoldings - Schemes with their holdings
 * @returns Overlap matrix with statistics
 */
export function calculateOverlapMatrix(
  schemesWithHoldings: SchemeWithHoldings[]
): OverlapMatrix | null {
  // Filter schemes that have holdings
  const validSchemes = schemesWithHoldings.filter(
    (s) => s.holdings && s.holdings.stock_holding && s.holdings.stock_holding.length > 0
  );

  if (validSchemes.length < 2) {
    return null; // Need at least 2 schemes for overlap analysis
  }

  const n = validSchemes.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // Build stock name sets for each scheme
  const schemeSets: Set<string>[] = validSchemes.map(
    (s) => new Set(s.holdings!.stock_holding.map((stock) => stock.name))
  );

  // Calculate overlaps
  let totalOverlap = 0;
  let comparisons = 0;
  let minOverlap = Infinity;
  let maxOverlap = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        // Diagonal: scheme overlaps with itself (show holding count)
        matrix[i][j] = schemeSets[i].size;
      } else if (i < j) {
        // Calculate overlap (only upper triangle to avoid duplication)
        const overlap = calculateSetOverlap(schemeSets[i], schemeSets[j]);
        matrix[i][j] = overlap;
        matrix[j][i] = overlap; // Symmetric

        totalOverlap += overlap;
        comparisons++;
        minOverlap = Math.min(minOverlap, overlap);
        maxOverlap = Math.max(maxOverlap, overlap);
      }
    }
  }

  // Build metadata
  const schemeMetadata: SchemeMetadata[] = validSchemes.map((s) => ({
    id: s.scheme.id,
    name: s.scheme.name,
    isin: s.scheme.isin,
    marketValue: s.scheme.marketValue,
    holdingsCount: s.holdings!.stock_holding.length,
  }));

  return {
    schemes: schemeMetadata,
    matrix,
    statistics: {
      minOverlap: comparisons > 0 ? minOverlap : 0,
      maxOverlap,
      avgOverlap: comparisons > 0 ? totalOverlap / comparisons : 0,
      totalComparisons: comparisons,
    },
  };
}

/**
 * Calculate overlap between two sets of stock names
 * @param set1 - First set of stock names
 * @param set2 - Second set of stock names
 * @returns Count of common stocks
 */
function calculateSetOverlap(set1: Set<string>, set2: Set<string>): number {
  let count = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      count++;
    }
  }
  return count;
}

/**
 * Generate analysis summary with key metrics
 * @param schemesWithHoldings - Schemes with holdings
 * @param aggregatedStocks - Aggregated stocks map
 * @param overlapMatrix - Overlap matrix (can be null)
 * @returns Summary statistics
 */
export function generateSummary(
  schemesWithHoldings: SchemeWithHoldings[],
  aggregatedStocks: Map<string, WeightedStock>,
  overlapMatrix: OverlapMatrix | null
): AnalysisSummary {
  const totalSchemes = schemesWithHoldings.length;
  const schemesWithoutHoldings = schemesWithHoldings
    .filter((s) => s.holdings === null)
    .map((s) => s.scheme.name);

  const totalUniqueStocks = aggregatedStocks.size;

  // Count unique sectors
  const uniqueSectors = new Set<string>();
  for (const stock of aggregatedStocks.values()) {
    uniqueSectors.add(stock.sector || 'Unknown');
  }

  // Calculate total market value
  const totalMarketValue = schemesWithHoldings.reduce((sum, s) => sum + s.scheme.marketValue, 0);

  return {
    totalSchemes,
    totalUniqueStocks,
    totalUniqueSectors: uniqueSectors.size,
    totalMarketValue,
    averageOverlap: overlapMatrix?.statistics.avgOverlap ?? 0,
    lastUpdated: new Date(),
    schemesWithoutHoldings,
  };
}
