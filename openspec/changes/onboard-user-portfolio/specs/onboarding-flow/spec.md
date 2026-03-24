# Spec: Onboarding Flow (Asynchronous)

## ADDED Requirements

### 1. Onboarding Page Access & Redirection

As a user, I should only be able to access the onboarding page if I haven't already set up my portfolio.

#### Scenario: Redirect after Signup

- **Given** I am on the signup page
- **When** I complete the signup form with valid details
- **Then** I should be redirected to `/onboard`

#### Scenario: Redirect from Dashboard (Un-onboarded)

- **Given** I am an authenticated user with no portfolio data and `onboardingStatus` is not `'completed'` or `'processing'`
- **When** I attempt to access `/dashboard` or any other dashboard sub-route
- **Then** I should be redirected to `/onboard`

#### Scenario: Redirect from Onboard (Already Onboarded)

- **Given** I am an authenticated user and my `onboardingStatus` is `'completed'`
- **When** I attempt to access `/onboard`
- **Then** I should be redirected to `/dashboard`

### 2. Portfolio PDF Upload & Processing

As a user on the onboarding page, I should be able to upload my CAS PDF so that my portfolio is processed in the background while I can continue to the dashboard.

#### Scenario: Upload PDF and Redirect to Dashboard

- **Given** I am on the `/onboard` page
- **When** I select a valid CAS PDF file and enter its password
- **And** I click "Upload and Parse"
- **Then** the system should upload the PDF to Firebase Storage
- **And** the system should set my `onboardingStatus` to `'processing'` in Firestore
- **And** the UI should redirect me to the `/dashboard` page

#### Scenario: Dashboard Message During Processing

- **Given** I am on the `/dashboard` page
- **And** my `onboardingStatus` is `'processing'`
- **Then** the UI should display a message: "Processing your portfolio, please wait, it can take 5-10 minutes."

#### Scenario: Handle Processing Failure

- **Given** my `onboardingStatus` was `'processing'`
- **When** the background process fails (e.g., wrong password, parsing error)
- **Then** the system should set my `onboardingStatus` to `'failed'`
- **And** when I visit the dashboard, I should see an error message with a link to retry at `/onboard`
