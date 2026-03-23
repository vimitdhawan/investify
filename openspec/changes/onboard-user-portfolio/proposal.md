# Proposal: Onboard User Portfolio via PDF (Asynchronous Flow)

## Summary

Add a secure onboarding experience where new users can upload their Mutual Fund CAS PDF. Instead of a synchronous API, we will use a **Server Action** to upload the file to Firebase Storage and track the parsing progress via Firestore. A background process will then invoke `casparser` (Python) to extract data, map it, and ingest it into the user's portfolio.

## Problem Statement

Users need an easy way to import their historical data from CAS PDFs. PDF parsing can be time-consuming, so a robust asynchronous flow with progress tracking is needed to ensure a smooth user experience.

## Proposed Solution

1. **Onboarding Route**: New or un-onboarded users are directed to `/onboard`.
2. **Server Action**: A `handlePortfolioUpload` action will:
   - Receive the PDF file and password.
   - Upload the file to Firebase Storage (`users/{userId}/onboarding/statement.pdf`).
   - Update the user's Firestore document with `{ onboardingStatus: 'processing' }`.
3. **Background Processing**: Trigger the parsing logic "behind the scenes".
   - Run a Python script (`casparser`) via `child_process.spawn`.
   - Map the output to our internal `PortfolioDTO` format.
   - Ingest data using the `ingestion-service`.
   - On success: Update `{ onboardingStatus: 'completed' }`.
   - On failure: Update `{ onboardingStatus: 'failed', onboardingError: '...' }`.
4. **UI Updates**:
   - The onboarding page will show a "Processing..." view while the status is `'processing'`.
   - Real-time updates via Firestore listeners will automatically transition the user to the dashboard upon completion.

## Alternative Considerations

- **Synchronous API**: Rejected in favor of an Action-based flow with status tracking to prevent timeouts on large PDFs and provide a better UX during longer processing times.

## Risks & Mitigations

- **Privacy**: PDFs are stored in private Firebase Storage paths with strict security rules. They are deleted immediately after successful ingestion.
- **In-process Failures**: If the server restarts during parsing, the status remains `'processing'`. A cleanup/retry mechanism may be needed for long-stale tasks.
