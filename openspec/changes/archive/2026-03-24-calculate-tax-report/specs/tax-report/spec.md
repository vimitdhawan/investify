# Capability: Tax Report

This capability allows users to view a detailed tax report for any fiscal year based on realized capital gains using FIFO logic.

## ADDED Requirements

### Requirement: Calculate Realized Gains using FIFO with Holding Periods

The system MUST correctly match sale transactions with corresponding purchase transactions in a first-in-first-out manner to determine the holding period for each realized unit.

#### Scenario: Sale matches exactly one purchase

- **Given** a user has purchased 100 units of an Equity fund on 2022-01-01 and sold 100 units on 2023-01-02.
- **When** the tax report for FY 2022-23 is requested.
- **Then** the system should show 100 realized units with a holding period of 366 days and categorize them as LTCG.

#### Scenario: Sale matches multiple purchases (FIFO)

- **Given** a user has purchased 50 units on 2022-01-01 and another 50 units on 2022-06-01.
- **When** the user sells 75 units on 2023-02-01.
- **Then** the report should show two entries for this sale:
  - 50 units with holding period > 1 year (LTCG).
  - 25 units with holding period < 1 year (STCG).

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

### Requirement: Group Realized Gains by Fiscal Year

The system SHALL provide a way to filter and aggregate realized gains by the Indian fiscal year (1 April to 31 March).

#### Scenario: Transactions across multiple fiscal years

- **Given** realized gains in both May 2022 and April 2023.
- **When** the user selects FY 2022-23.
- **Then** only the gain from May 2022 is displayed.
- **When** the user selects FY 2023-24.
- **Then** only the gain from April 2023 is displayed.
