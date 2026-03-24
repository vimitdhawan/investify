# Change: Refactor Realized Gains to Use Grouped Details

## Why

The current tax report implementation displays unit-level realized gains, resulting in excessive detail that makes the report difficult to read and analyze. Users need to see aggregated gains grouped by scheme, folio number, sale date, and tax type (LTCG/STCG/Debt) rather than individual unit-level transactions.

Additionally, the tax summary calculation should leverage the same grouped data to ensure consistency and improve performance.

## What Changes

- **Service Layer Enhancement**: Add grouping logic to aggregate unit-level realized gains into grouped detail records based on scheme name, folio number, sale date, and tax type
- **New Data Type**: Introduce `RealizedGainLoss` interface to represent grouped realized gain details
- **Component Update**: Modify `RealizedGainsTable` component to display grouped data instead of unit-based details
- **Summary Calculation**: Update tax report summary calculation to use grouped realized gains data
- **Consolidation**: Aggregate buy amounts, sell amounts, gain/loss, and tax paid for transactions that match the grouping criteria

## Impact

- **Affected specs**: `tax-report`
- **Affected code**:
  - Service layer for tax report calculation (likely `src/services/tax-report.ts` or similar)
  - `src/features/tax-report/components/RealizedGainsTable.tsx`
  - Tax report summary calculation logic
  - Type definitions for realized gains data structures

## Benefits

- **Improved Readability**: Users see consolidated entries instead of dozens of individual unit transactions
- **Better Performance**: Fewer rows to render in the table component
- **Consistency**: Single source of truth for both table display and summary calculations
- **Maintainability**: Centralized grouping logic in the service layer
