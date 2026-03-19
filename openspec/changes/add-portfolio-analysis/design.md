# Portfolio Analysis - Technical Design

## Context

The application has recently ingested mutual fund holdings data from Moneycontrol API into a Firestore `holdings/{ISIN}` collection. Each user has a portfolio of schemes with ISINs. To provide comprehensive portfolio insights, we need to:

1. Map user schemes to their ingested holdings data
2. Aggregate and weight holdings across all schemes
3. Calculate derived metrics (top stocks, sectors, overlaps)
4. Visualize results with interactive D3.js charts

## Goals / Non-Goals

**Goals:**

- Display top 5 stocks and sectors across entire portfolio (globally aggregated, weighted by allocation)
- Visualize portfolio overlap between scheme pairs as an interactive matrix
- Provide real-time calculation of all metrics on page load
- Build reusable D3.js visualization components for future analytics
- Create intuitive, production-ready visualizations

**Non-Goals:**

- Historical trend analysis (can be added later)
- Advanced filtering/segmentation (MVP phase)
- Export/reporting capabilities (future feature)
- Machine learning recommendations (future phase)
- Caching/pre-computation (start with real-time)

## Decisions

### D3.js Integration Method: **Visx (Airbnb's React-first D3 library)**

**Why Visx?**

- **React-native**: Works seamlessly with hooks and component patterns
- **Composable**: Build visualizations from low-level D3 components
- **TypeScript support**: Full type safety for D3 operations
- **Zero lock-in**: Easy to migrate to raw D3 if needed later
- **Next.js compatible**: No SSR issues, works with React Server Components

**Architecture:**

```
D3.js (core charting)
  ↓
Visx (React wrapper & components)
  ↓
Custom React components (bar chart, heatmap)
  ↓
Portfolio Analysis Page (integrates all)
```

### Data Flow Architecture

```
User Portfolio Load
  ↓
[Portfolio Analysis Service]
  1. Fetch all user schemes
  2. For each scheme, get its ISIN
  3. Fetch holdings/{ISIN} from Firestore
  4. Aggregate: combine all stock holdings across schemes
  5. Weight: multiply by scheme allocation % in portfolio
  ↓
[Calculation Layer]
  - Top 5 stocks: sort by weighted percentage
  - Top 5 sectors: group holdings by sector, sum weights
  - Overlap matrix: compare holding lists pairwise
  ↓
[Visualization Layer]
  - D3 Bar Charts: top stocks and sectors
  - D3 Heatmap: overlap matrix (scheme × scheme)
  ↓
Rendered to user
```

### Aggregation & Weighting Formula

```
For each stock in portfolio:
  weighted_stock_value = Σ (stock_value_in_scheme × scheme_weight_in_portfolio)

where:
  scheme_weight = scheme_market_value / total_portfolio_market_value
  stock_value_in_scheme = stock_holding_percentage × scheme_nav_value
```

### Overlap Calculation

```
overlap(scheme_A, scheme_B) = count of stock names that appear in both schemes

Matrix: N×N grid where N = number of schemes
  - Cell (i,j) = overlap count between scheme_i and scheme_j
  - Diagonal = each scheme overlaps with itself (no overlap count shown)
  - Symmetric: overlap(A,B) = overlap(B,A)
```

### Data Models

**Portfolio Analysis Input:**

```typescript
interface PortfolioScheme {
  id: string;
  name: string;
  isin: string;
  marketValue: number; // Current NAV × units
  units: number;
}

interface Holdings {
  asset_alloc: { equity_alloc: string; ... };
  market_cap_weightage: { large_cap: number; ... };
  concentration: { number_of_holding: number; ... };
  stock_holding: StockHolding[];
}

interface StockHolding {
  name: string;
  sector: string;
  value: string;
  weighting: string; // percentage as string
}
```

**Aggregated Analysis Output:**

```typescript
interface PortfolioAnalysis {
  topStocks: AggregatedStock[];
  topSectors: AggregatedSector[];
  overlapMatrix: OverlapMatrix;
  summary: AnalysisSummary;
}

interface AggregatedStock {
  name: string;
  sector: string;
  weightedPercentage: number;
  appearsInSchemes: string[];
}

interface AggregatedSector {
  name: string;
  weightedPercentage: number;
  stockCount: number;
}

interface OverlapMatrix {
  schemes: SchemeMetadata[];
  matrix: number[][]; // N×N overlap counts
  statistics: {
    minOverlap: number;
    maxOverlap: number;
    avgOverlap: number;
  };
}
```

## Alternatives Considered

**Alternative 1: Use Recharts instead of D3.js/Visx**

- Pro: Simpler, already in project
- Con: Limited heatmap/matrix visualization, less customizable
- **Rejected**: Heatmap quality not sufficient for professional analysis

**Alternative 2: Pre-calculate/cache analysis in Cloud Functions**

- Pro: Better performance for large portfolios
- Con: Added infrastructure, delayed insights, higher costs
- **Rejected**: MVP requires real-time insights; caching added in Phase 2

**Alternative 3: Fetch holdings on-demand per scheme**

- Pro: Smaller API surface
- Con: Multiple Firestore reads, slower page load
- **Chosen**: Batch fetch in single service call

## Risks / Trade-offs

**Risk 1: Performance with large portfolios (50+ schemes)**

- Mitigation: Start with real-time; add memoization if needed
- Monitoring: Track page load time, add performance metrics

**Risk 2: Visx learning curve for team**

- Mitigation: Detailed comments in D3 components; clear examples
- Investment: 2-3 hours to understand visx patterns

**Risk 3: Overlap matrix display UX (50+ schemes = 2500 cells)**

- Mitigation: Start with schemes < 30; add filtering in Phase 2
- Alternative: Use hierarchical clustering for large portfolios

**Risk 4: Stock name matching inconsistencies**

- Mitigation: Assume Moneycontrol data is clean; validate in QA
- Future: Add fuzzy matching if needed

## Migration Plan

**No breaking changes.** Additive feature only:

1. Add D3.js + Visx dependencies
2. Create portfolio analysis feature module
3. Add new analysis page to routing
4. No modifications to existing schemas or pages

**Rollout:**

- Phase 1: Full feature (no feature flags needed)
- Phase 2: Add filtering, caching
- Phase 3: Add historical trends

## Open Questions

1. Should overlap matrix show "no overlap" cells (0) or only highlight overlaps > threshold?
2. Should top 5 stocks be by absolute portfolio weight or by concentration risk?
3. Any specific color scheme preferences for heatmap intensity (cool/warm)?
