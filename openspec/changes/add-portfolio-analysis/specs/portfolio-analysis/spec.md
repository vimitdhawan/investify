# Portfolio Analysis Specification

## ADDED Requirements

### Requirement: Integrate Holdings Data with Portfolio

The system SHALL fetch ingested holdings data from Firestore for each scheme in the user's portfolio and match holdings by ISIN to build a complete picture of underlying stocks and sectors.

#### Scenario: User with multiple schemes has holdings data available

- **WHEN** a user with 3 schemes (each with a valid ISIN) views the portfolio analysis page
- **AND** holdings data exists in the `holdings/{ISIN}` collection
- **THEN** the system fetches holdings for all 3 ISINs
- **AND** displays data indicating successful integration (e.g., "3 holdings loaded", timestamp)

#### Scenario: Scheme has no holdings data available

- **WHEN** a user has a scheme with ISIN but no matching holdings record
- **THEN** the system gracefully handles the missing data
- **AND** skips that scheme in aggregation without error
- **AND** displays a warning or note about incomplete data

### Requirement: Aggregate Stock Holdings Across Portfolio

The system SHALL aggregate all individual stock holdings from all schemes in the portfolio, weighted by each scheme's allocation, to determine portfolio-wide stock exposure.

#### Scenario: Multiple schemes hold the same stock

- **WHEN** Scheme A holds HDFC Bank (5% of scheme) with market value ₹50K
- **AND** Scheme B holds HDFC Bank (3% of scheme) with market value ₹30K
- **AND** Scheme A represents 60% of portfolio value, Scheme B represents 40%
- **THEN** HDFC Bank's weighted portfolio percentage = (5%×60%) + (3%×40%) = 4.2%

#### Scenario: Display top 5 stocks globally

- **WHEN** the aggregation completes
- **THEN** the system displays the top 5 stocks by weighted percentage
- **AND** each stock shows: name, sector, weighted percentage, schemes it appears in
- **AND** stocks are sorted descending by percentage

### Requirement: Analyze Sector Exposure

The system SHALL group all holdings by sector and calculate the sector's total weight across the portfolio to identify sector concentration and diversification.

#### Scenario: Calculate total sector weight

- **WHEN** a portfolio has stocks from 5 sectors: Banking (40%), IT (25%), Pharma (20%), Infrastructure (10%), FMCG (5%)
- **THEN** the system displays top 5 sectors with their respective weightings
- **AND** top sectors are ranked by percentage (descending)

#### Scenario: Sector includes multiple stocks

- **WHEN** Banking sector contains 25 stocks with varying weights
- **THEN** the system groups all 25 stocks under Banking
- **AND** displays sum of weights as the sector weight
- **AND** indicates the count of unique stocks in the sector

### Requirement: Calculate Portfolio Overlap Matrix

The system SHALL compare the stock holdings of each scheme pair to identify overlaps and potential concentration risk from similar investments.

#### Scenario: Calculate pairwise overlaps

- **WHEN** there are 5 schemes in the portfolio
- **THEN** the system calculates overlap for all 5×5 = 25 scheme pairs
- **AND** overlap(Scheme_A, Scheme_B) = count of stocks that appear in both

#### Scenario: Display overlap matrix as heatmap

- **WHEN** calculation completes
- **THEN** the system displays a visual heatmap matrix
- **AND** rows = schemes, columns = schemes
- **AND** cell color intensity represents overlap count (darker = higher overlap)
- **AND** each cell shows the exact overlap count as a tooltip
- **AND** the matrix includes statistics (min, max, average overlap)

#### Scenario: Symmetric overlap relationship

- **WHEN** comparing Scheme A vs Scheme B
- **THEN** overlap(A,B) = overlap(B,A)
- **AND** the matrix displays as symmetric across the diagonal

### Requirement: Visualize Analysis with D3.js Charts

The system SHALL provide interactive, production-quality D3.js visualizations for all analysis components (bar charts for stocks/sectors, heatmap for overlaps).

#### Scenario: Top stocks bar chart

- **WHEN** user views portfolio analysis page
- **THEN** system displays a horizontal bar chart
- **AND** X-axis = percentage weight (0-100%)
- **AND** Y-axis = stock names (top 5)
- **AND** bars colored by sector or a gradient
- **AND** chart is interactive (hover shows exact percentage)

#### Scenario: Sector distribution chart

- **WHEN** user views sector analysis
- **THEN** system displays a bar chart of top 5 sectors
- **AND** each bar labeled with sector name and percentage
- **AND** bars sorted by percentage (descending)

#### Scenario: Overlap heatmap interaction

- **WHEN** user hovers over a heatmap cell
- **THEN** system shows tooltip with:
  - Scheme A name, Scheme B name
  - Overlap count (e.g., "15 stocks in common")
  - Percentage of each scheme's holdings that overlap

### Requirement: Display Portfolio Analysis Page

The system SHALL provide a dedicated analysis page accessible from the main navigation, displaying all analysis components in an organized, responsive layout.

#### Scenario: Navigate to analysis page

- **WHEN** user clicks "Portfolio Analysis" in navigation
- **THEN** system loads `/analysis` page
- **AND** page title = "Portfolio Analysis"
- **AND** page displays sections for:
  - Top Holdings (with bar chart and table)
  - Sector Analysis (with bar chart and table)
  - Portfolio Overlap (with heatmap matrix)
  - Analysis Summary (key metrics)

#### Scenario: Loading state

- **WHEN** page loads and data is being fetched
- **THEN** system displays skeleton loaders for each section
- **AND** shows "Loading portfolio analysis..." message
- **AND** prevents interaction until data loads

#### Scenario: Error handling

- **WHEN** holdings data cannot be fetched for any reason
- **THEN** system displays user-friendly error message
- **AND** message explains the issue (e.g., "No holdings data available")
- **AND** provides option to retry or return to dashboard

#### Scenario: Responsive design

- **WHEN** user views analysis page on mobile (<768px)
- **THEN** system displays components in single-column layout
- **AND** charts are fully visible and interactive
- **AND** heatmap matrix may be scrollable or collapsed into details

### Requirement: Calculate Analysis Summary Metrics

The system SHALL provide quick-reference metrics summarizing the portfolio's holdings composition.

#### Scenario: Display summary statistics

- **WHEN** analysis completes
- **THEN** system displays:
  - Total unique stocks in portfolio
  - Total unique sectors represented
  - Average overlap between schemes
  - Number of schemes analyzed
  - Last update timestamp

#### Scenario: Summary updates in real-time

- **WHEN** page loads
- **THEN** summary metrics calculate immediately
- **AND** timestamp reflects current time
- **AND** user can see how comprehensive their portfolio is at a glance
