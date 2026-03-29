# Tasks: Onboard User Portfolio via PDF

- [ ] **Phase 1: Foundation & Refactoring**
  - [ ] Create `src/features/onboarding` directory.
  - [ ] Extract ingestion logic from `scripts/ingest-portfolio.ts` into `src/features/onboarding/service.ts`.
  - [ ] Update `scripts/ingest-portfolio.ts` to use the new service (optional but good for testing).
  - [ ] Test that existing ingestion still works.

- [ ] **Phase 2: PDF Parsing Bridge**
  - [ ] Create a Python script `scripts/parse_cas.py` that uses `casparser` to parse a PDF and output JSON to stdout.
  - [ ] Create `requirements.txt` with `casparser`.
  - [ ] Create `src/features/onboarding/casparser-transformer.ts` to transform the `casparser` JSON DTO to our internal `Portfolio` model.
  - [ ] Implement a core function `processPortfolioPDF(userId, storagePath, password)` in `src/features/onboarding/service.ts` to handle the full background lifecycle.

- [ ] **Phase 3: Onboarding UI & Server Action**
  - [ ] Create the `/onboard` route and page component in `src/app/(dashboard)/onboard/page.tsx` (using components from `src/features/onboarding`).
  - [ ] Create a Server Action `handlePortfolioUpload` in `src/features/onboarding/action.ts` that:
    - Uploads the PDF to Firebase Storage.
    - Sets Firestore `onboardingStatus` to `'processing'`.
    - Triggers `processPortfolioPDF` without awaiting its completion.
    - Redirects the user to `/dashboard`.

- [ ] **Phase 4: Dashboard Feedback & Access Control**
  - [ ] Update `src/app/(dashboard)/layout.tsx` to handle redirection to `/onboard` if `onboardingStatus` is missing or `'failed'`.
  - [ ] Implement a "Processing..." notification component in `src/features/onboarding/components/processing-status.tsx`.
  - [ ] Add the `ProcessingStatus` component to the Dashboard layout to show when `onboardingStatus === 'processing'`.
  - [ ] Add a middleware or layout-level check to redirect users from `/onboard` to `/dashboard` if they are already onboarded.
  - [ ] Update signup action to redirect new users to `/onboard`.
  - [ ] Ensure the PDF is deleted from Firebase Storage after processing.
