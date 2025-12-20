# Project Investify: Gemini Agent Guide

This document provides a comprehensive overview of the Investify project, its architecture, and development guidelines for the Gemini agent.

## 1. Project Overview

Investify is a modern, responsive web application designed for portfolio analytics of Indian mutual funds. It allows users to gain insights into their investments, track performance, and visualize their portfolio's growth over time.

**Core User Goals:**
- Analyze overall portfolio performance.
- Track daily gains and losses.
- Visualize historical NAV (Net Asset Value) of individual schemes.
- View detailed transaction history for each scheme.

## 2. Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Authentication & DB:** [Firebase](https://firebase.google.com/) (Firebase Auth, Firestore, Storage)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Charting:** [Recharts](https://recharts.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Linting:** [ESLint](https://eslint.org/)

## 3. Design Philosophy

The primary goal is to deliver an exceptional User Experience (UX) with a clean, intuitive, and data-rich interface. The application must be fully responsive, providing a seamless experience across desktops, tablets, and mobile devices.

- **Clarity:** Data should be presented in a clear and easy-to-understand manner.
- **Responsiveness:** All components and layouts must adapt to different screen sizes.
- **Interactivity:** Charts and data tables should be interactive to allow users to explore their data.

## 4. Project Structure & Domains

The project follows a feature-based organization within the Next.js App Router. Code is structured around the primary domains of the application.

```
/src
├── app/
│   ├── (dashboard)/      # Authenticated user routes
│   │   ├── dashboard/    # Main dashboard page
│   │   ├── fund-houses/  # (Future) Fund house information
│   │   ├── schemes/      # Scheme-specific pages
│   │   │   ├── [id]/
│   │   │   │   ├── chart/        # NAV Chart Page
│   │   │   │   └── transactions/ # Transaction List Page
│   │   └── layout.tsx      # Layout for the dashboard
│   ├── (public)/         # Publicly accessible routes (e.g., login, signup)
│   └── api/              # API routes for server-side logic
│       ├── portfolio/
│       └── schemes/
├── components/
│   ├── auth/             # Login/Signup form components
│   ├── side-bar/         # Main application navigation
│   └── ui/               # Reusable UI components from shadcn/ui
├── lib/
│   ├── actions/          # Server Actions for form handling (login, signup)
│   ├── repository/       # Data access layer (interacts with APIs/DB)
│   ├── schema/           # Zod schemas for form validation
│   └── types/            # TypeScript type definitions for all domains
└── ...
```

### Core Domains:

-   **Portfolio:** Represents the user's entire collection of mutual funds. The logic for processing the overall portfolio, calculating aggregate values (total investment, market value, gains/losses), resides in `lib/repository/portfolio.ts`.
-   **Mutual Funds:** Represents holdings within a single fund house (AMC).
-   **Schemes:** Represents a specific mutual fund scheme (e.g., DSP Nifty 50 Index Fund). This domain includes viewing historical performance (NAV chart) and details.
-   **Transactions:** Represents individual buy, sell, or switch operations within a scheme.

## 5. Testing Strategy

Maintaining code quality and reliability is crucial. The project will incorporate a robust testing strategy.

-   **Unit Tests:** Jest and React Testing Library will be added to test individual components, utility functions, and repository logic. The goal is to ensure that each "unit" of the application works as expected in isolation.
-   **Integration Tests:** (Future) Tests will be written to ensure that different parts of the application work together correctly (e.g., client-side components correctly fetching and displaying data from API routes).
-   **End-to-End (E2E) Tests:** (Future) Playwright or Cypress could be used to simulate user journeys and verify critical user flows from login to portfolio analysis.

## 6. Production-Ready Checklist

Before deploying to production, the following aspects must be addressed:

-   **Environment Variables:**
    -   All secrets (Firebase credentials, API keys, etc.) must be stored in environment variables (`.env.local`) and never hard-coded.
    -   A `.env.example` file should be maintained to document required variables.
-   **Error Handling & Logging:**
    -   Implement a centralized logging service (e.g., Sentry, Logtail) to capture and monitor errors in production.
    -   Graceful error handling on the client-side with user-friendly error messages and boundaries.
-   **Performance:**
    -   Code-splitting is handled automatically by the Next.js App Router.
    -   Optimize images using `next/image`.
    -   Analyze bundle sizes to ensure only necessary code is shipped to the client.
-   **Security:**
    -   All user input must be validated on the client and server-side (using Zod).
    -   Implement appropriate security headers.
    -   Ensure Firebase security rules (for Firestore/Storage) are properly configured to prevent unauthorized data access.
-   **Build & Deployment:**
    -   The `npm run build` command must pass without errors.
    -   Set up a CI/CD pipeline (e.g., using GitHub Actions) to automate testing, linting, and deployment.
    -   Deploy to a suitable platform like Vercel or Netlify.
