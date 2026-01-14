# Data Model Guide

This document provides a detailed description of the core data types used throughout the Investify application. These types are defined in `/src/lib/types/` and form the foundation of our business logic.

## 1. Core Entities

The data model revolves around the user's investment portfolio, which consists of mutual funds, schemes, and transactions.

### `Portfolio`

Represents the user's entire investment portfolio at a specific point in time.

-   **`investor: Investor`**: Information about the portfolio owner.
-   **`statements: Statement[]`**: A list of imported CAS statements.
-   **`schemes: Scheme[]`**: A flat list of all schemes the user is invested in.

---

### `Scheme`

Represents a single mutual fund scheme holding. This is a central entity in our data model.

-   **`id: string`**: A unique identifier for the scheme holding, typically a combination of AMC, folio, and AMFI code.
-   **`name: string`**: The full name of the mutual fund scheme (e.g., "Parag Parikh Flexi Cap Fund Direct Growth").
-   **`amc: string`**: The name of the Asset Management Company (e.g., "Axis Mutual Fund").
-   **`amfi: string`**: The unique AMFI code for the scheme.
-   **`isin: string`**: The ISIN of the scheme.
-   **`folioNumber: string`**: The user's folio number for this specific scheme holding.
-   **`units: number`**: The total number of units currently held.
-   **`investedAmount: number`**: The total cost basis of the current holdings (the principal amount invested).
-   **`marketValue: number`**: The current market value of the holdings (`units * nav`).
-   **`isClosed: boolean`**: A flag indicating if the holding is closed (i.e., all units have been sold).
-   **`realizedGainLoss: number`**: The total profit or loss realized from selling units.
-   **`unrealizedGainLoss: number`**: The notional profit or loss on the current holdings (`marketValue - investedAmount`).
-   **`transactions: Transaction[]`**: A list of all transactions associated with this scheme.

---

### `Transaction`

Represents a single transaction (buy, sell, etc.) within a scheme.

-   **`id: string`**: A unique identifier for the transaction.
-   **`schemeId: string`**: The ID of the parent scheme this transaction belongs to.
-   **`date: string`**: The date of the transaction (format: `YYYY-MM-DD`).
-   **`description: string`**: The description of the transaction from the CAS statement.
-   **`type: TransactionType`**: The type of transaction (e.g., `PURCHASE`, `REDEMPTION`, `DIVIDEND_REINVESTMENT`). `TransactionType` is a string enum.
-   **`nav: number`**: The Net Asset Value (NAV) per unit on the transaction date.
-   **`units: number`**: The number of units involved in the transaction.
-   **`amount: number`**: The total amount of the transaction in rupees.

---

### `MutualFundView`

This is a **view model**, not a core entity. It is used for display purposes on the UI to group schemes by their AMC.

-   **`name: string`**: The name of the AMC.
-   **`folioNumbers: string[]`**: A list of all folio numbers the user has with this AMC.
-   **`investedAmount: number`**: The total invested amount across all *active* schemes in this fund house.
-   **`marketValue: number`**: The total market value across all *active* schemes in this fund house.
-   **`realizedGainLoss: number`**: The total realized gain/loss across all schemes (both active and closed) in this fund house.
-   **`schemes: SchemeView[]`**: A list of scheme view models belonging to this fund house.

---

## 2. Data Flow & Transformation

1.  **Ingestion**: Raw portfolio data (from a `.json` file) is ingested by the `ingest-portfolio.ts` script. This script transforms the raw DTOs (Data Transfer Objects) into our core `Scheme` and `Transaction` entities.
2.  **Storage**: The transformed data is stored in Firestore. User data is stored under `/users/{userId}`, with schemes and transactions in sub-collections.
3.  **Repository Layer**: The `/lib/repository` layer is responsible for fetching data from Firestore and transforming it into the data models defined here. For example, `getPortfolioFromFirestore` assembles the complete `Portfolio` object.
4.  **View Models**: For display, the repository layer may further process the core entities into "view models" (like `MutualFundView` or `SchemeView`) that are tailored for a specific UI component. These view models might contain calculated fields like `marketValue` or aggregated data.
