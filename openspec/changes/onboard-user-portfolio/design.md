# Design: Onboarding Flow & Ingestion Service

## Architecture Overview

The system provides an asynchronous onboarding experience. After a user uploads their CAS PDF, the system immediately redirects them to the dashboard and processes the file in the background.

## Components

### 1. Onboarding Feature (`src/features/onboarding`)

- **Purpose**: Dedicated space for all onboarding-related logic and components.
- **Access Policy**: The `/onboard` route is only accessible to users with no portfolio and whose `onboardingStatus` is not `'completed'`.

### 2. Ingestion Service (`src/features/onboarding/service.ts`)

Extract logic from `scripts/ingest-portfolio.ts` into a permanent service.

- **`ingestPortfolioData(portfolio, userId)`**: Handles Firestore batch operations to save the transformed `Portfolio` object.

### 3. Upload & Processing Flow

1. **Frontend**: User uploads PDF and enters password in the `/onboard` form.
2. **Server Action (`handlePortfolioUpload`)**:
   - **Step A**: Save PDF to Firebase Storage at `users/{userId}/onboarding/statement.pdf`.
   - **Step B**: Update Firestore:
     ```json
     {
       "onboardingStatus": "processing",
       "onboardingStartedAt": "timestamp"
     }
     ```
   - **Step C**: Trigger the background process (e.g., via a non-awaited async function or a worker).
   - **Step D**: Redirect user to `/dashboard`.

### 4. Background Processing Logic

- **Python Bridge**: Execute `python scripts/parse_cas.py` to parse the PDF.
- **DTO Transformation**: Use `src/features/onboarding/casparser-transformer.ts` to map the `casparser` DTO to our internal `Portfolio` model.
- **Ingestion**: Call the `ingestion-service` to commit data to Firestore.
- **Cleanup**: Delete the PDF from Firebase Storage.
- **Status Update**: Update `onboardingStatus` to `'completed'` or `'failed'`.

### 5. UI/UX Strategy

- **Dashboard Notification**: When `onboardingStatus === 'processing'`, the dashboard displays: "Processing your portfolio, please wait, it can take 5-10 minutes."
- **Onboarding Page**: Contains the upload form and handles errors if the initial upload/start fails.

## Data Mapping Detail

The transformation will map the `casparser` DTO:

```typescript
export interface CasParserDTO {
  statement_period: { from: string; to: string };
  file_type: string;
  cas_type: string;
  investor_info: { email: string; name: string; mobile: string; address: string };
  folios: Array<{
    folio: string;
    amc: string;
    PAN: string;
    schemes: Array<{
      scheme: string;
      isin: string;
      amfi: string;
      valuation: { date: string; nav: number; value: number; cost: number };
      transactions: Array<{
        date: string;
        description: string;
        amount: number;
        units: number;
        nav: number;
        type: string;
      }>;
    }>;
  }>;
}
```

The transformer will map this directly to the `Portfolio` type.
