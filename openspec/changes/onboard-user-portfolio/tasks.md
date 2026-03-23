# Tasks: Onboard User Portfolio via PDF

- [ ] **Phase 1: Foundation & Refactoring**
  - [ ] Extract ingestion logic from `scripts/ingest-portfolio.ts` into a new service `src/features/portfolio/ingestion-service.ts`.
  - [ ] Update `scripts/ingest-portfolio.ts` to use the new service.
  - [ ] Test that existing ingestion still works with `VIMIT_PORTFOLIO.json`.

- [ ] **Phase 2: PDF Parsing Bridge**
  - [ ] Create a Python script `scripts/parse_cas.py` that uses `casparser` to parse a PDF and output JSON to stdout.
  - [ ] Create `requirements.txt` with the necessary Python dependencies.
  - [ ] Create `src/features/portfolio/casparser-transformer.ts` to transform the `casparser` output to `PortfolioDTO`.
  - [ ] Implement a core function `processPortfolioPDF(userId, storagePath, password)` to handle parsing, transformation, and ingestion.

- [ ] **Phase 3: Onboarding UI & Server Action**
  - [ ] Create the `/onboard` route and page component.
  - [ ] Create a Server Action `handlePortfolioUpload` that:
    - Uploads the PDF to Firebase Storage.
    - Sets Firestore `onboardingStatus` to `'processing'`.
    - Triggers the parsing logic "behind the scenes".
  - [ ] Implement a full-page "Processing..." UI state in `/onboard`.
  - [ ] Add a real-time Firestore listener to automatically transition the user to the dashboard upon success.

- [ ] **Phase 4: Navigation & Polish**
  - [ ] Implement redirection from `src/app/(dashboard)/layout.tsx` to `/onboard` if the user has no portfolio or a pending onboarding status.
  - [ ] Update signup action to redirect new users to `/onboard`.
  - [ ] Add robust error handling (e.g., wrong password, timeout) and display failure messages on the onboarding page.
  - [ ] Cleanup temporary files in Firebase Storage and local storage after processing.
