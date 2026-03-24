# Proposal: Onboard User Portfolio via PDF (Asynchronous Flow)

## Summary

Add a secure onboarding experience where new users can upload their Mutual Fund CAS PDF. We will use a **Server Action** to upload the file to Firebase Storage and track the parsing progress via Firestore. A background process will then invoke `casparser` (Python) to extract data, map it to our internal `Portfolio` model, and ingest it.

## Problem Statement

Users need an easy way to import their historical data from CAS PDFs. PDF parsing can be time-consuming. We need a flow that handles this asynchronously and provides immediate feedback while the heavy lifting happens in the background.

## Proposed Solution

1. **Onboarding Route**: New or un-onboarded users are directed to `/onboard`. This route is only accessible if the user has not yet completed onboarding (i.e., no portfolio exists).
2. **Onboarding Feature**: All UI components and logic for the onboarding flow will be located in `src/features/onboarding`.
3. **Server Action**: A `handlePortfolioUpload` action will:
   - Receive the PDF file and password.
   - Upload the file to Firebase Storage (`users/{userId}/onboarding/statement.pdf`).
   - Update the user's Firestore document with `{ onboardingStatus: 'processing' }`.
   - Immediately redirect the user to the dashboard.
4. **Background Processing**: Trigger the parsing logic "behind the scenes".
   - Run a Python script (`casparser`) via `child_process.spawn`.
   - The output will follow the `casparser` DTO structure.
   - Map the DTO directly to our internal `Portfolio` type using a new transformer.
   - Ingest data using the `ingestion-service`.
   - On success: Update `{ onboardingStatus: 'completed' }`.
   - On failure: Update `{ onboardingStatus: 'failed', onboardingError: '...' }`.
5. **UI Updates**:
   - If a user is in the `'processing'` state, the dashboard will display a non-intrusive message: "Processing your portfolio, please wait, it can take 5-10 minutes."
   - If a user attempts to access `/onboard` after completion, they are redirected to the dashboard.

## Data Mapping

The system will ingest data directly from the `casparser` JSON output, transforming it into our internal `Portfolio`, `Scheme`, and `Transaction` models.

## Risks & Mitigations

- **Privacy**: PDFs are stored in private Firebase Storage paths and deleted immediately after processing.
- **Processing Time**: Users are informed of the 5-10 minute wait time to manage expectations.
