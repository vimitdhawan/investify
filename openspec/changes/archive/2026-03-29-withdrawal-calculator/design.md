# Design: Withdrawal Calculator

## Architecture Overview

The Withdrawal Calculator is a client-side utility that leverages existing FIFO logic from the `tax-report` service. It allows users to simulate a redemption (sell) for any scheme in their portfolio using the most recent NAV.

## Components

### 1. Withdrawal Calculator Modal (`src/features/schemes/components/withdrawal-calculator.tsx`)

- **State Management**:
  - `selectedSchemeId`: ID of the scheme the user wants to simulate for.
  - `withdrawalAmount`: Target amount the user wants to withdraw.
  - `withdrawalUnits`: Target units the user wants to withdraw.
  - Calculations update whenever these values change.
- **Input Sync**: Changes in units automatically update the calculated amount (Units \* NAV), and changes in amount update calculated units (Amount / NAV).
- **Display**: A table or card showing the estimated gains:
  - LTCG (Long-term)
  - STCG (Short-term)
  - Debt Gains
  - Total Estimated Tax Impact (optional, but valuable)

### 2. Integration with Scheme List

- A "Withdrawal Calculator" button is added to the toolbar of `SchemeList`.
- This button opens the modal.

### 3. Simulation Logic (`src/features/tax-report/service.ts`)

The simulation logic resides in the `tax-report` service to leverage existing FIFO calculation engines.

Introduce a new function `simulateWithdrawal(transactions, schemeInfo, unitsToRedeem, nav)`:

1. Filters relevant transactions for the given scheme.
2. Creates a "Mock Sale" transaction with:
   - `date`: Today's date.
   - `units`: `unitsToRedeem` (as a negative value).
   - `nav`: The provided NAV.
3. Appends the mock sale to existing transactions.
4. Calls `calculateRealizedGainsDetailed` on the updated transaction list.
5. Returns only the realized gains associated with the mock sale.

## UI/UX Details

- **Responsive Design**: The modal must be usable on both desktop and mobile.
- **Immediate Feedback**: Results should update as the user types their withdrawal target.
- **Validation**: Ensure the user cannot "withdraw" more units than they currently hold.
