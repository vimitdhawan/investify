# Proposal: Calculate Tax Report

This proposal introduces a new "Tax Report" feature to help users understand their realized capital gains (LTCG, STCG, and Debt gains) for any given fiscal year (1 April to 31 March), following Indian taxation rules for mutual funds.

## Goals

1.  **Automated Tax Calculation:** Calculate Long-Term Capital Gains (LTCG) and Short-Term Capital Gains (STCG) based on a First-In-First-Out (FIFO) logic for all realized units.
2.  **Asset Classification:** Differentiate between Equity and Debt funds to apply correct taxation rules.
3.  **Fiscal Year Reporting:** Group realized gains by the Indian fiscal year (April 1 to March 31).
4.  **Dedicated UI:** Provide a comprehensive view for users to select a fiscal year and see their tax liabilities.

## Scope

- **FIFO Logic Implementation:** Update transaction processing to track purchase dates for all realized units.
- **Tax Classification & Calculation Logic:**
  - **Equity Funds:**
    - LTCG (>1 year holding): Taxed at **12.5%** with a **₹1,25,000 exemption (rebate)** on total LTCG per fiscal year.
    - STCG (<=1 year holding): Taxed at **20%**.
  - **Debt Funds:** Gains categorized as "Tax Slab" and taxed based on the user's selected income tax slab.
- **New Tax Report Page:** A new route `/tax-report` with a summary and detailed breakdown per scheme.
- **Navigation Update:** Add "Tax Report" to the sidebar.

## Out of Scope

- **Unrealized Gains Taxation:** Tax is only calculated on realized units.
- **Grandfathering Clause:** Handling pre-2018 LTCG rules (we will assume current rules for simplicity unless specified).
- **Tax Filing:** This is a reporting tool, not an automated filing service.
- **TDS Handling:** TDS (Tax Deducted at Source) for NRIs or dividend taxation (unless already tracked in transactions).

## Success Criteria

- Users can view a summary of LTCG, STCG, and Debt gains for any fiscal year with realized transactions.
- The report accurately reflects the holding period for each realized unit using FIFO.
- The UI provides a clear breakdown per scheme for validation.
