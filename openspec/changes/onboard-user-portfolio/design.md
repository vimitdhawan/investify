# Design: Asynchronous Portfolio Ingestion Service

## Architecture Overview

The system provides a non-blocking onboarding experience by offloading the PDF parsing to a server-side process, while the UI reflects the status in real-time using Firestore.

## Components

### 1. Ingestion Refactoring

Extract logic from `scripts/ingest-portfolio.ts` into `src/features/portfolio/ingestion-service.ts`.

- **Functionality**: `ingestPortfolioData(portfolioData, userId)` handles Firestore batch operations.

### 2. Upload & Processing Flow

1. **Frontend**: The user uploads a PDF and password to a **Server Action**.
2. **Server Action (`handlePortfolioUpload`)**:
   - **Step A**: Save the PDF to Firebase Storage at `users/{userId}/onboarding/statement.pdf`.
   - **Step B**: Update the user document in Firestore:
     ```json
     {
       "onboardingStatus": "processing",
       "onboardingStartedAt": "timestamp"
     }
     ```
   - **Step C**: Trigger the parsing logic "behind the scenes". This could be done by awaiting a separate function that starts the `child_process.spawn`.

### 3. Background Processing Logic

The background task will:

- **Download PDF**: Retrieve the file from Firebase Storage.
- **Parse**: Execute the Python bridge script:
  ```bash
  python scripts/parse_cas.py --pdf <temp_path> --password <password>
  ```
- **Transform**: Convert `casparser` JSON to internal `PortfolioDTO`.
- **Ingest**: Call `ingestPortfolioData`.
- **Cleanup**: Delete the PDF from Firebase Storage and temporary local storage.
- **Status Update**: On completion or failure, update `onboardingStatus` accordingly.

### 4. UI/UX Strategy

- **Onboarding Page**:
  - **Upload State**: Shows the file upload form.
  - **Processing State**: When `onboardingStatus === 'processing'`, show a full-page loading state ("Processing your portfolio...").
  - **Error State**: Displays a descriptive error message with a "Retry" button.
- **Real-time Navigation**: The page uses a Firestore listener to detect when `onboardingStatus` becomes `'completed'` and automatically redirects to the dashboard.

## Data Mapping Detail

The transformation will use `src/features/portfolio/casparser-transformer.ts` to map fields:

- `investor_info` -> `investor`
- `statement_period` -> `meta.statement_period`
- `folios` -> `mutual_funds`
- `schemes` (inside folios) -> `schemes`
- `transactions` (inside schemes) -> `transactions`
