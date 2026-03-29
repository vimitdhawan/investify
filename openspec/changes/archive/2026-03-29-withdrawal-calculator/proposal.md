# Proposal: Withdrawal Calculator (What-if Analysis)

## Why

Users need a way to estimate the tax implications and realized gains/losses before actually performing a withdrawal. Currently, the system only shows realized gains after they have occurred. A "What-if" calculator helps users make informed decisions about which schemes to liquidate and how many units to sell to optimize their tax liability (e.g., staying within the ₹1.25L LTCG rebate).

## What Changes

- **Withdrawal Calculator Component**: A new modal/popup component that allows users to:
  - Select a scheme from their portfolio.
  - Enter the number of units or the amount they wish to withdraw.
  - See real-time calculations for LTCG, STCG, and Debt gains based on the current NAV.
- **Scheme Page Integration**: Add a "Withdrawal Calculator" button to the `SchemeList` page toolbar.
- **Simulation Service**: Enhance or wrapper around the `tax-report` service to calculate gains for a "mock" sale transaction today.
- **UI/UX**: Clear presentation of potential gain/loss and tax impact.

## Impact

- **Affected specs**: `tax-report` (new simulated calculation requirement)
- **Affected code**:
  - `src/features/tax-report/service.ts` (simulation logic using FIFO)
  - `src/features/schemes/service.ts` (data fetching for the calculator)
  - `src/features/schemes/components/scheme-list.tsx`
  - New component in `src/features/schemes/components/withdrawal-calculator.tsx`

## Benefits

- **Tax Planning**: Users can plan withdrawals to minimize tax.
- **Decision Support**: Immediate feedback on the financial impact of a potential sale.
- **User Engagement**: Adds a powerful utility for portfolio management.
