# Spec: Onboarding Flow (Asynchronous)

## ADDED Requirements

### 1. New User Redirection

As a new user, I should be redirected to the onboarding page after signing up so that I can provide my portfolio data.

#### Scenario: Redirect after Signup

- **Given** I am on the signup page
- **When** I complete the signup form with valid details
- **Then** I should be redirected to `/onboard`

#### Scenario: Redirect from Dashboard (Un-onboarded)

- **Given** I am an authenticated user with no portfolio data and `onboardingStatus` is not `'completed'`
- **When** I attempt to access `/dashboard` or any other dashboard sub-route
- **Then** I should be redirected to `/onboard`

### 2. Portfolio PDF Upload & Processing

As a user on the onboarding page, I should be able to upload my CAS PDF so that my portfolio is processed in the background.

#### Scenario: Upload PDF and Enter Processing State

- **Given** I am on the `/onboard` page
- **When** I select a valid CAS PDF file and enter its password
- **And** I click "Upload and Parse"
- **Then** the system should upload the PDF to Firebase Storage
- **And** the system should set my `onboardingStatus` to `'processing'` in Firestore
- **And** the UI should display a "Processing your portfolio..." message

#### Scenario: Automatic Redirect on Completion

- **Given** I am on the `/onboard` page and my status is `'processing'`
- **When** the background process successfully ingests my portfolio
- **And** the system sets my `onboardingStatus` to `'completed'`
- **Then** the UI should automatically redirect me to the dashboard

#### Scenario: Handle Processing Failure

- **Given** I am on the `/onboard` page and my status is `'processing'`
- **When** the background process fails (e.g., wrong password, parsing error)
- **Then** the system should set my `onboardingStatus` to `'failed'`
- **And** the UI should display a clear error message with a "Retry" button
