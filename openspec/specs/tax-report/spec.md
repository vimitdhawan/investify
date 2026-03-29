# tax-report Specification

## Purpose

TBD - created by archiving change calculate-tax-report. Update Purpose after archive.

## Requirements

### Requirement: Calculate Realized Gains using FIFO with Holding Periods

The system SHALL support simulation of realized gains by allowing mock sale transactions to be processed through the standard FIFO engine.

#### Scenario: Simulated sale for withdrawal calculation

- **Given** a set of existing purchase transactions.
- **When** a "mock" sale transaction for today is provided with a specific unit count and NAV.
- **Then** the system should return the calculated LTCG, STCG, or Debt gains for those units as if the sale had occurred today.

### Requirement: Categorize Gains by Asset Type and Holding Period

The system SHALL apply Indian taxation rules to categorize gains based on the scheme type and holding period.

#### Scenario: Equity LTCG

- **Given** a scheme with `type: EQUITY` and units held for > 365 days.
- **Then** the realized gain is categorized as LTCG.

#### Scenario: Equity STCG

- **Given** a scheme with `type: EQUITY` and units held for <= 365 days.
- **Then** the realized gain is categorized as STCG.

#### Scenario: Debt Gains

- **Given** a scheme with `type: DEBT`.
- **Then** the realized gain is categorized as "Tax Slab" gains.

### Requirement: Apply Tax Rates and Rebates

The system SHALL calculate the estimated tax liability based on the latest tax rates and the LTCG rebate.

#### Scenario: Apply LTCG rebate

- **Given** a user has total LTCG of ₹1,50,000 in a fiscal year.
- **When** the tax is calculated.
- **Then** the taxable amount for LTCG should be ₹25,000 (1,50,000 - 1,25,000) and tax should be ₹3,125 (25,000 \* 12.5%).

#### Scenario: LTCG below rebate

- **Given** a user has total LTCG of ₹1,00,000.
- **When** the tax is calculated.
- **Then** the taxable amount and tax should be ₹0.

#### Scenario: Apply STCG tax

- **Given** a user has total STCG of ₹50,000.
- **When** the tax is calculated.
- **Then** the tax should be ₹10,000 (50,000 \* 20%).

### Requirement: Display Realized Gains in Tax Report

The system SHALL display realized gains in the tax report using grouped entries rather than individual unit-level transactions to improve readability and usability.

#### Scenario: Tax report table shows grouped entries

- **Given** a user has multiple sale transactions
- **When** the tax report is displayed
- **Then** the RealizedGainsTable should show grouped entries with scheme name, folio number, sale date, buy amount, sell amount, gain/loss, tax paid, and tax type
- **And** the number of rows should be significantly reduced compared to unit-level display

#### Scenario: Tax summary uses grouped data

- **Given** grouped realized gains have been calculated in the service layer
- **When** the tax summary is computed
- **Then** the summary calculations (total LTCG, STCG, Debt gains, and tax amounts) should be derived from the same grouped data used in the table

### Requirement: Group Realized Gains by Scheme, Folio, Date, and Tax Type

The system SHALL aggregate unit-level realized gains into grouped entries based on scheme name, folio number, sale date, and tax type (LTCG/STCG/Debt) to provide a consolidated view.

#### Scenario: Multiple units sold on same date with same tax type

- **Given** a user has sold 50 units and 30 units of the same scheme from the same folio on 2023-05-15, both resulting in LTCG
- **When** the tax report is generated
- **Then** the system should display one grouped entry with:
  - Scheme name and folio number
  - Sale date: 2023-05-15
  - Tax type: LTCG
  - Total buy amount: sum of (purchase price × units) for both transactions
  - Total sell amount: sum of (sale price × units) for both transactions
  - Total gain/loss: sum of individual gains/losses
  - Total tax paid: sum of tax paid on both transactions

#### Scenario: Same scheme sold on different dates

- **Given** a user has sold units of Scheme A on 2023-05-15 and 2023-06-20
- **When** the tax report is generated
- **Then** the system should display two separate grouped entries, one for each sale date

#### Scenario: Same scheme with different tax types on same date

- **Given** a user has sold units resulting in both LTCG and STCG on 2023-05-15 from the same folio
- **When** the tax report is generated
- **Then** the system should display two separate grouped entries, one for LTCG and one for STCG

#### Scenario: Different folios of same scheme

- **Given** a user has sold units from Folio A and Folio B of the same scheme on 2023-05-15
- **When** the tax report is generated
- **Then** the system should display two separate grouped entries, one for each folio number

### Requirement: RealizedGainLoss Data Structure

The system SHALL define a `RealizedGainLoss` type to represent grouped realized gain details with the following properties: scheme name, folio number, sale date, buy amount, sell amount, gain/loss, tax paid, and tax type indicators (isLTCG, isSTCG, isDebt).

#### Scenario: Grouped data structure contains aggregated amounts

- **Given** multiple unit-level transactions are grouped together
- **When** the `RealizedGainLoss` object is created
- **Then** it SHALL contain:
  - `schemeName`: The name of the scheme
  - `folioNumber`: The folio number
  - `saleDate`: The sale date
  - `buyAmount`: Sum of (purchase price × units) for all matching transactions
  - `sellAmount`: Sum of (sale price × units) for all matching transactions
  - `gainLoss`: Sum of all individual gain/loss amounts
  - `taxPaid`: Sum of all tax paid amounts
  - `isLTCG`, `isSTCG`, `isDebt`: Boolean flags indicating the tax type

### Requirement: Potential Withdrawal (What-if) Analysis

The system SHALL provide a "What-if" calculator to help users estimate the tax impact of a potential redemption.

#### Scenario: User inputs units to withdraw

- **Given** the user has 1000 units of a scheme.
- **When** the user enters 500 units into the Withdrawal Calculator.
- **Then** the system SHALL display the estimated gain breakdown (LTCG/STCG/Debt) for those 500 units based on the current NAV.

#### Scenario: User inputs amount to withdraw

- **Given** the user has units worth ₹1,00,000 at current NAV.
- **When** the user enters ₹50,000 as the target withdrawal amount.
- **Then** the system SHALL automatically calculate the required units and display the estimated tax impact.

#### Scenario: Prevent over-withdrawal

- **Given** the user has 100 units of a scheme.
- **When** the user attempts to enter 150 units for simulation.
- **Then** the system SHALL display a validation error or cap the input to the current balance.
