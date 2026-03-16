# Change: Add Mutual Fund Holdings Ingestion Script

## Why

Users need to see the underlying stock holdings and asset allocation for their mutual fund investments. This data is not currently available in our system. Automating the ingestion of this data from a reliable source (Moneycontrol API) will enable features like sector exposure analysis and concentration risk assessment.

## What Changes

- New script `scripts/ingest-holdings.ts` to:
  - Read `SchemeData.csv` for scheme information and ISINs.
  - Group schemes by "Scheme Name" to deduplicate portfolio fetching.
  - Fetch holding details from Moneycontrol API.
  - Parse and save details to a new `holdings` collection in Firestore.
- Data saved per ISIN:
  - Asset allocation (Equity, Bond, Cash, etc.)
  - Market cap weightage (Large, Mid, Small cap)
  - Concentration metrics (Number of holdings, Top 10 stock weight, etc.)
  - Individual stock holdings (Name, Sector, Value, Weighting)

## Impact

- Affected specs: `holdings-ingestion` (new)
- Affected code:
  - New file: `scripts/ingest-holdings.ts`
- Database: New Firestore collection `holdings` keyed by ISIN.
