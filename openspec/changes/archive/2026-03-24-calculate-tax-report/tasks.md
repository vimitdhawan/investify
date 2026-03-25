# Tasks: Tax Report Implementation

This list covers the implementation of the Tax Report feature, including logic, UI, and navigation.

## 1. Logic & Utilities

- [x] **Add Fiscal Year Utilities:**
  - Implement `getFiscalYear`, `getFiscalYearRange`, and current year detection in `src/lib/utils/date.ts`.
  - Add tests for these utilities.
- [x] **Implement Detailed Realized Gains Service:**
  - Create `calculateRealizedGainsDetailed` in `src/features/transactions/service.ts`.
  - Implement the FIFO logic that pairs each sale with its corresponding purchase.
  - Return the detailed structure including holding periods and tax types.
  - Add unit tests for FIFO and tax categorization (LTCG/STCG/Slab).

## 2. Page & Components

- [x] **Create Tax Report Page Structure:**
  - Scaffold `src/app/(dashboard)/tax-report/page.tsx`.
  - Add a server-side data fetching logic to gather all realized gains for the user.
- [x] **Implement UI Components with Tax Calculation Logic:**
  - `FiscalYearSelect`: Dropdown to filter gains by fiscal year.
  - `TaxSummaryCards`: Visualize total gains by category.
    - Implement **12.5% tax logic for LTCG** with **₹1,25,000 rebate**.
    - Implement **20% tax logic for STCG**.
    - Implement **Tax Slab logic** for Debt funds.
    - Show the rebate amount clearly in the LTCG summary.
  - `RealizedGainsTable`: Detailed tabular view of transactions with search and sorting.
- [x] **Add Sidebar Navigation:**
  - Update `src/features/side-bar/components/app-sidebar.tsx` (or appropriate file) to include the "Tax Report" link.

## 3. Validation & Testing

- [x] **End-to-End Verification:**
  - Verify that realized gains in the Tax Report match the "Realized Gains" total in the Dashboard.
  - Test with different combinations of purchase/sale dates to ensure correct LTCG/STCG flagging.
  - Test tax amount calculations including the ₹1.25L rebate.
  - Test edge cases like partial sales and multiple purchases.
- [x] **Performance Audit:**
  - Ensure transaction processing is efficient for users with many historical entries.
