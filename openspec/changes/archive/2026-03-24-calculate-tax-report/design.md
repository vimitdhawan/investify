# Design: Tax Report

This design outlines the technical approach for implementing a detailed Tax Report with realized gains (FIFO) categorized by Indian fiscal year and mutual fund type (Equity/Debt), incorporating the latest tax rates and rebates.

## Architecture

### 1. Data Layer Enhancements

We need to create or update service functions to return detailed realized gains information that includes holding periods.

- **`RealizedGainDetail` Type**:

  ```typescript
  interface RealizedGainDetail {
    schemeId: string;
    schemeName: string;
    schemeType: SchemeType;
    units: number;
    purchaseDate: Date;
    saleDate: Date;
    purchasePrice: number;
    salePrice: number;
    gainLoss: number;
    holdingPeriodDays: number;
    isLTCG: boolean;
    isSTCG: boolean;
    fiscalYear: string; // e.g., "2023-24"
  }
  ```

- **`src/features/transactions/service.ts`**: Implement a new function `calculateRealizedGainsDetailed` that uses FIFO to match sales to specific purchase dates. This function will return an array of `RealizedGainDetail`.

### 2. Tax Calculation Logic

- **Holding Period**: `saleDate - purchaseDate` in days.
- **Equity (LTCG vs STCG)**:
  - If `schemeType === 'EQUITY'`, `isLTCG = holdingPeriodDays > 365`.
  - If `schemeType === 'EQUITY'`, `isSTCG = !isLTCG`.
- **Debt (Tax Slab)**:
  - If `schemeType === 'DEBT'`, gains are categorized as "Tax Slab" gains.

- **Tax Rates & Rebates**:
  - **LTCG (Equity)**: 12.5% on gains exceeding ₹1,25,000 per fiscal year.
  - **STCG (Equity)**: 20% on total gains.
  - **Tax Slab (Debt)**: User-defined tax slab (e.g., 5%, 10%, 20%, 30%).

### 3. Fiscal Year Utilities

We will add utility functions in `src/lib/utils/date.ts`:

- `getFiscalYear(date: Date)`: Returns the string representation of the fiscal year (e.g., "2023-24").
- `getFiscalYearRange(fiscalYear: string)`: Returns the start (April 1st) and end (March 31st) dates for the given fiscal year.

### 4. UI Components

- **Route**: `src/app/(dashboard)/tax-report/page.tsx`
- **Controller**: A server-side component or client-side with a server action to fetch all realized gains for the current user and filter them by fiscal year.
- **Components**:
  - **`FiscalYearSelect`**: A dropdown to switch between available fiscal years.
  - **`TaxSummaryCards`**: Displaying total LTCG, STCG, and Slab Gains for the selected year. **Include the ₹1,25,000 rebate in the LTCG summary card.**
  - **`RealizedGainsTable`**: A detailed list of all realized gain entries with their respective buy/sell dates and prices.

### 5. Data Retrieval Flow

1.  Fetch all schemes for the user.
2.  For each scheme, retrieve all transactions.
3.  Process transactions using the `calculateRealizedGainsDetailed` (FIFO) function.
4.  Gather all `RealizedGainDetail` entries across all schemes.
5.  Filter by the selected fiscal year on the frontend (or pass fiscal year to the service).

## Technical Decisions

- **FIFO Implementation**: We will use a "running purchases" queue per scheme. As sales happen, we dequeue (or partially consume) from the earliest purchase.
- **Handling Transfers (Switch In/Out)**: Treated similarly to Buy/Sell for taxation purposes.
- **Rounding**: Financial calculations should be rounded to 2 decimal places to match Indian reporting standards.
- **Metadata Configuration**: For now, tax rates and rebates will be hardcoded in the UI components, with a plan to migrate them to a Firebase metadata document in the future.
