## 1. Setup & Dependencies

- [x] 1.1 Add D3.js and Visx dependencies to `package.json`
- [x] 1.2 Verify dependencies install without conflicts
- [x] 1.3 Create feature module structure: `src/features/portfolio-analysis/`

## 2. Data Layer & Service

- [x] 2.1 Create `src/features/portfolio-analysis/type.ts` with core TypeScript interfaces
- [x] 2.2 Create `src/features/portfolio-analysis/repository.ts` to fetch holdings from Firestore
- [x] 2.3 Create `src/features/portfolio-analysis/service.ts` with aggregation logic:
  - [x] 2.3.1 Function to match schemes with holdings data by ISIN
  - [x] 2.3.2 Function to aggregate and weight stocks across portfolio
  - [x] 2.3.3 Function to calculate top 5 stocks globally
  - [x] 2.3.4 Function to group and calculate top 5 sectors
  - [x] 2.3.5 Function to calculate pairwise overlap matrix
  - [x] 2.3.6 Function to generate analysis summary (unique stocks count, sector diversity, etc.)

## 3. Visualization Components

- [x] 3.1 Create D3/Visx wrapper components in `src/features/portfolio-analysis/components/`:
  - [x] 3.1.1 `BarChart.tsx` - Reusable horizontal bar chart for stocks/sectors
  - [x] 3.1.2 `HeatmapMatrix.tsx` - D3 heatmap for overlap matrix visualization
  - [x] 3.1.3 `OverlapLegend.tsx` - Legend showing overlap counts and statistics
- [x] 3.2 Create display components:
  - [x] 3.2.1 `TopStocksCard.tsx` - Top 5 stocks with chart and table
  - [x] 3.2.2 `TopSectorsCard.tsx` - Top 5 sectors with chart and table
  - [x] 3.2.3 `PortfolioOverlapCard.tsx` - Overlap matrix with heatmap
  - [x] 3.2.4 `AnalysisSummaryCard.tsx` - Key metrics (total stocks, sectors, avg overlap)

## 4. Page Integration

- [x] 4.1 Create page structure: `src/app/(dashboard)/analysis/page.tsx`
- [x] 4.2 Integrate service to fetch and calculate analysis on page load
- [x] 4.3 Integrate all visualization components
- [x] 4.4 Add loading states (skeleton screens) while data loads
- [x] 4.5 Add error boundaries and error handling
- [x] 4.6 Add responsive layout (mobile, tablet, desktop)

## 5. Navigation & UX

- [x] 5.1 Add navigation link to analysis page in sidebar/nav
- [x] 5.2 Add page title, description, and help text
- [x] 5.3 Add "Last updated" timestamp on analysis data
- [x] 5.4 Implement smooth scroll and layout animations

## 6. Testing & Validation

- [x] 6.1 Write unit tests for aggregation/weighting logic
- [x] 6.2 Write unit tests for overlap calculation
- [x] 6.3 Write integration tests for service (fetch + calculate)
- [x] 6.4 Manual QA:
  - [x] 6.4.1 Test with 5+ schemes, verify top stocks aggregation
  - [x] 6.4.2 Test with mixed asset classes (equity/debt), verify weighting
  - [x] 6.4.3 Test overlap matrix with duplicate holdings
  - [x] 6.4.4 Test with portfolio having no overlap (validate 0 values)
  - [x] 6.4.5 Test responsive design on mobile/tablet
  - [x] 6.4.6 Test performance with large portfolios (20+ schemes)

## 7. Documentation & Polish

- [x] 7.1 Add JSDoc comments to service functions
- [x] 7.2 Document D3/Visx component props and usage
- [x] 7.3 Add accessibility attributes (ARIA labels, keyboard navigation)
- [x] 7.4 Verify TypeScript strict mode compliance
- [x] 7.5 Run linter and formatter checks
- [x] 7.6 Add performance monitoring/logging

## 8. Final Verification

- [x] 8.1 Run `npm run check-all` (type check, lint, format, tests, build)
- [x] 8.2 Manual end-to-end test of entire analysis workflow
- [x] 8.3 Verify page loads and displays correctly for multiple users
- [x] 8.4 Confirm all holdings data displays correctly
