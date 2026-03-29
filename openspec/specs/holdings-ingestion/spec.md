# holdings-ingestion Specification

## Purpose

TBD - created by archiving change add-holdings-ingestion-script. Update Purpose after archive.

## Requirements

### Requirement: Extract ISIN and Metadata from Scheme CSV

The ingestion script MUST parse `SchemeData.csv` to extract the `Scheme Name` and all valid ISINs associated with each scheme.

#### Scenario: Parse ISINs

- **WHEN** the script reads a CSV line with merged ISINs (e.g., `INF209K01157INF209K01CE5`)
- **THEN** it identifies each 12-character ISIN starting with "INF".

### Requirement: Fetch Holdings with Deduplication

The script SHALL fetch holding details from the Moneycontrol API for each unique `Scheme Name` and share the result among all associated ISINs.

#### Scenario: Share holdings among related schemes

- **WHEN** multiple schemes have the same `Scheme Name` (e.g., Growth, Regular, IDCW variants)
- **THEN** the script calls the API once for the group and saves the same holding data for each ISIN in the group.

### Requirement: Save Holding Details to Firestore

The script MUST save the portfolio data received from the API into a new Firestore collection named `holdings`, using the ISIN as the document ID.

#### Scenario: Store holding data structure

- **WHEN** valid JSON is received from the Moneycontrol API
- **THEN** the system saves a document containing `asset_alloc`, `market_cap_weightage`, `concentration`, and `stock_holding` fields.

### Requirement: Error Handling and Rate Limiting

The script SHALL implement rate limiting (delays between API calls) and handle API failures or missing data gracefully without stopping the entire process.

#### Scenario: API Failure

- **WHEN** the Moneycontrol API returns an error or empty data for an ISIN
- **THEN** the script logs the failure for that specific ISIN/scheme and continues to the next one.
