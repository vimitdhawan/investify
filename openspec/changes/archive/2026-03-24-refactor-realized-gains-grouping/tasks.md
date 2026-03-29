# Implementation Tasks

## 1. Type Definitions

- [x] 1.1 Create `RealizedGainLoss` interface with properties: schemeName, folioNumber, saleDate, buyAmount, sellAmount, gainLoss, taxPaid, isLTCG, isSTCG, isDebt
- [x] 1.2 Update existing type imports in affected files

## 2. Service Layer Implementation

- [x] 2.1 Locate the tax report calculation service/function
- [x] 2.2 Implement grouping logic using Map with composite key: `${schemeName}-${folioNumber}-${saleDateStr}-${taxType}`
- [x] 2.3 Iterate through unit-level gains and aggregate:
  - buyAmount = sum of (purchasePrice × units)
  - sellAmount = sum of (salePrice × units)
  - gainLoss = sum of individual gainLoss values
  - taxPaid = sum of individual taxPaid values
- [x] 2.4 Convert grouped Map to array of `RealizedGainLoss` objects
- [x] 2.5 Return grouped realized gains from service function

## 3. Component Updates

- [x] 3.1 Update `RealizedGainsTable.tsx` to accept `RealizedGainLoss[]` type instead of unit-based type
- [x] 3.2 Update table columns to display grouped data fields (buyAmount, sellAmount, gainLoss, taxPaid)
- [x] 3.3 Remove unit-level specific columns if any
- [x] 3.4 Update any formatting/display logic for the new data structure

## 4. Tax Summary Calculation

- [x] 4.1 Locate tax summary calculation logic
- [x] 4.2 Update to use the same grouped `RealizedGainLoss[]` data
- [x] 4.3 Calculate totals by filtering/reducing grouped data:
  - Total LTCG = sum of gainLoss where isLTCG is true
  - Total STCG = sum of gainLoss where isSTCG is true
  - Total Debt gains = sum of gainLoss where isDebt is true
  - Total tax paid = sum of taxPaid across all groups
- [x] 4.4 Ensure rebate calculations still work correctly with grouped data

## 5. Integration and Testing

- [x] 5.1 Test with single transaction (should create one group)
- [x] 5.2 Test with multiple transactions matching same group key
- [x] 5.3 Test with transactions across different dates/folios/tax types
- [x] 5.4 Verify tax summary totals match grouped data
- [x] 5.5 Verify UI displays grouped entries correctly
- [x] 5.6 Test edge cases (empty data, single group, many groups)

## 6. Cleanup

- [x] 6.1 Remove any unused unit-level type definitions if no longer needed
- [x] 6.2 Update any documentation or comments referencing unit-level structure
