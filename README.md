This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Mutual Fund Portfolio Analyzer - Application Specification

1. Overview

The Mutual Fund Portfolio Analyzer is a web application designed to provide users with a comprehensive and in-depth analysis of their mutual fund investments. Users can upload their Consolidated Account Statement (CAS) from CAMS/KFINTECH, and the application will automatically parse, analyze, and visualize their portfolio.

2. Technology Stack

Frontend: Next.js (React)
Backend: Next.js API Routes (Node.js)
Database: Google Firebase (Firestore, Firebase Authentication)
PDF Parsing Library: A Node.js compatible library (e.g., `pdf-parse`).
Diagrams: PlantUML

3. Core Features

3.1. Data Ingestion & Processing

- PDF Upload: Users can upload their password-protected or non-password-protected CAS PDF.
- Automated Parsing: A backend process will read the PDF, extract all transactions (SIPs, redemptions, switches), and store them in a structured format in the database.

  3.2. XIRR Calculation (Highest Priority)

- The application will calculate the Extended Internal Rate of Return (XIRR) for each individual fund and for the overall portfolio.
- This provides an accurate, annualized return percentage, accounting for all cash flows at their specific dates.

  3.3. Tax & Charges Analysis

- The system will identify and aggregate all fees and taxes paid by the user, including:
  - **Stamp Duty**: On purchases.
  - **Securities Transaction Tax (STT)**: On equity fund redemptions.
  - **Tax Deducted at Source (TDS)**: On debt fund redemptions.
  - **Exit Loads**: If applicable on early redemptions.
- A dedicated section will show the user the total amount paid in charges.

  3.4. Capital Gains on Withdrawals

- When a user redeems (withdraws) units, the application will calculate the profit using the **First-In, First-Out (FIFO)** accounting method.
- It will classify the gains into:
  - **Short-Term Capital Gains (STCG)**
  - **Long-Term Capital Gains (LTCG)**
- The classification will follow Indian tax laws (Equity: >1 year is Long-Term; Debt: >3 years is Long-Term). This helps users understand their tax liability.

  3.5. Interactive Portfolio Visualization

- A dashboard with interactive charts (e.g., pie charts, bar charts) to visualize portfolio allocation.
- Users can break down their portfolio by:
  - **Fund House**: (e.g., DSP, SBI, HDFC).
  - **Asset Class**: (e.g., Equity, Debt, Hybrid).
  - **Market Capitalization**: (e.g., Large-Cap, Mid-Cap, Small-Cap).
- This requires a system to categorize each fund scheme based on its name or an external data source.

  3.6. User Management

- Secure user registration and login using Firebase Authentication.
- Each user's data will be stored securely and will only be accessible to them.

4. High-Level Architecture & Data Flow

As requested, the architecture will be simplified to keep all business logic within the Next.js application, removing the need for a separate Firebase Cloud Function. The backend logic will be handled by **Next.js API Routes**.

The data flow will work as follows: The Next.js frontend will send the user's uploaded PDF directly to a dedicated API route. This route will be responsible for the entire processing pipeline—parsing the document, performing calculations, and storing the results in Firestore.

_(Note: For a large-scale application, this approach might lead to longer server response times for large PDFs. A more advanced pattern using pre-signed URLs to upload directly to a storage provider could be considered later for optimization.)_

PlantUML Sequence Diagram: PDF Upload & Processing (In-App Backend)

Here is the updated sequence diagram illustrating the new data flow.
