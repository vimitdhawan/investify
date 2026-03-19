/**
 * Portfolio Analysis Types
 * Core TypeScript interfaces for portfolio holdings analysis
 */

// ============================================================================
// Input Types (from existing data sources)
// ============================================================================

export interface PortfolioScheme {
  id: string;
  name: string;
  isin: string;
  marketValue: number; // Current NAV × units
  units: number;
  amc: string;
}

export interface StockHolding {
  name: string;
  sector: string;
  value: string;
  weighting: string; // percentage as string
}

export interface AssetAllocation {
  equity_alloc: string;
  bond_alloc: string;
  cash_alloc: string;
  other_alloc: string;
}

export interface MarketCapWeightage {
  large_cap: number;
  mid_cap: number;
  small_cap: number;
  others_cap: number;
}

export interface Concentration {
  number_of_holding: number;
  avg_market_cap: string;
  top_10_stk_wt: string;
  top_5_stk_wt: string;
  top_3_sector_wt: string;
}

export interface Holdings {
  asset_alloc: AssetAllocation;
  market_cap_weightage: MarketCapWeightage;
  concentration: Concentration;
  stock_holding: StockHolding[];
}

// ============================================================================
// Aggregated Output Types (calculated analysis results)
// ============================================================================

export interface AggregatedStock {
  name: string;
  sector: string;
  weightedPercentage: number;
  appearsInSchemes: string[]; // Scheme names
  rawValue?: number; // For debugging/sorting
}

export interface AggregatedSector {
  name: string;
  weightedPercentage: number;
  stockCount: number;
  stocks: string[]; // Stock names in this sector
}

export interface SchemeMetadata {
  id: string;
  name: string;
  isin: string;
  marketValue: number;
  holdingsCount: number;
}

export interface OverlapMatrix {
  schemes: SchemeMetadata[];
  matrix: number[][]; // N×N overlap counts
  statistics: {
    minOverlap: number;
    maxOverlap: number;
    avgOverlap: number;
    totalComparisons: number;
  };
}

export interface AnalysisSummary {
  totalSchemes: number;
  totalUniqueStocks: number;
  totalUniqueSectors: number;
  totalMarketValue: number;
  averageOverlap: number;
  lastUpdated: Date;
  schemesWithoutHoldings: string[]; // Scheme names that couldn't be analyzed
}

export interface PortfolioAnalysis {
  topStocks: AggregatedStock[];
  topSectors: AggregatedSector[];
  overlapMatrix: OverlapMatrix | null;
  summary: AnalysisSummary;
}

// ============================================================================
// Service/Repository Input Types
// ============================================================================

export interface SchemeWithHoldings {
  scheme: PortfolioScheme;
  holdings: Holdings | null;
}

export interface WeightedStock {
  name: string;
  sector: string;
  weight: number; // Weighted percentage in portfolio
  schemes: Set<string>; // Set of scheme names
}

export interface WeightedSector {
  name: string;
  weight: number;
  stocks: Set<string>;
}
