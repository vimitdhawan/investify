## Server vs Client Components Guideline

We **always prefer Server Components by default**.

Client Components should be introduced **only when client-side behavior is required**, such as:

* User interactions (selection, input, form state)
* Local UI state (toggles, tabs, modals)
* Browser-only APIs (window, localStorage, etc.)

**Guiding principle:**

* Keep Client Components **small, focused, and isolated**
* Compose them inside Server Components whenever possible
* Push data fetching, heavy logic, and layout composition to Server Components

This approach:

* Reduces client-side JavaScript
* Improves performance and SEO
* Keeps the architecture easier to reason about and scale

---

# Project Investify: Gemini Agent Guide

This document provides a comprehensive overview of the Investify project, its architecture, and development guidelines for the Gemini agent.

---

## 1. Project Overview

**Investify** is a modern, responsive web application for analyzing Indian mutual fund portfolios. It helps users understand their investments, track performance, and visualize portfolio growth over time.

### Core User Goals

* Analyze overall portfolio performance
* Track daily gains and losses
* Visualize historical NAV (Net Asset Value) for individual schemes
* View detailed transaction history per scheme

---

## 2. Tech Stack

* **Framework:** Next.js (App Router)
* **Authentication & Database:** Firebase (Auth, Firestore, Storage)
* **UI Components:** shadcn/ui
* **Styling:** Tailwind CSS
* **Charts:** Recharts
* **Language:** TypeScript
* **Linting:** ESLint

---

## 3. Design Philosophy

The primary goal is to deliver a **clean, intuitive, and data-rich user experience**.

Key principles:

* **Clarity:** Financial data should be easy to read and interpret
* **Responsiveness:** Seamless experience across desktop, tablet, and mobile
* **Interactivity:** Charts and tables should encourage exploration without overwhelming the user

---

## 4. Project Structure & Domains

The project follows a **feature-based structure** using the Next.js App Router. Code is organized by domain rather than technical layers.

```
/src
├── app/
│   ├── (dashboard)/          # Authenticated routes
│   │   ├── dashboard/        # Portfolio overview
│   │   ├── fund-houses/      # (Future) AMC-level views
│   │   ├── schemes/
│   │   │   ├── [id]/
│   │   │   │   ├── chart/          # NAV chart page
│   │   │   │   └── transactions/   # Transaction history
│   │   └── layout.tsx        # Dashboard layout
│   ├── (public)/             # Public routes (login, signup)
│   └── api/                  # Server-side API routes
│       ├── portfolio/
│       └── schemes/
├── components/
│   ├── auth/                 # Authentication UI
│   ├── side-bar/             # Navigation
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── actions/              # Server Actions (auth, forms)
│   ├── repository/           # Data access layer
│   ├── schema/               # Zod schemas
│   └── types/                # Shared TypeScript types
└── ...
```

---

### Core Domains

* **Portfolio**
  Represents the user’s complete investment portfolio.
  Aggregate calculations (total invested, market value, gains/losses) live in:

  ```
  lib/repository/portfolio.ts
  ```

* **Mutual Funds**
  Groups schemes by fund house (AMC).

* **Schemes**
  Represents a single mutual fund scheme (e.g., index fund, equity fund).
  Includes:

  * NAV history
  * Performance charts
  * Scheme-level metadata

* **Transactions**
  Individual buy, sell, or switch entries within a scheme.

---

## 5. Testing Strategy

Quality and correctness are critical for financial applications.

* **Unit Tests**

  * Use Jest and React Testing Library
  * Cover components, utility functions, and repository logic
  * Focus on deterministic, isolated tests

* **Integration Tests (Future)**

  * Validate interactions between components, API routes, and data layers

* **End-to-End Tests (Future)**

  * Use Playwright or Cypress
  * Cover critical user journeys (login → dashboard → scheme analysis)

---

## 6. Production-Ready Checklist

### Environment Variables

* Store all secrets in `.env.local`
* Never hard-code credentials
* Maintain `.env.example` for documentation

### Error Handling & Logging

* Centralized logging (Sentry, Logtail, etc.)
* Graceful client-side error states
* Error boundaries for critical UI sections

### Performance

* Server Components by default
* Automatic code-splitting via App Router
* Optimize images with `next/image`
* Minimize client-side JavaScript

### Security

* Validate all inputs using Zod (client + server)
* Configure Firebase security rules correctly
* Apply appropriate security headers

### Build & Deployment

* `npm run build` must pass without errors
* CI/CD via GitHub Actions (lint, test, build)
* Deploy to Vercel or Netlify

