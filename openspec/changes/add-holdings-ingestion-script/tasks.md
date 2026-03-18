## 1. Implementation

- [x] 1.1 Scaffold `scripts/ingest-holdings.ts` with required imports and types.
- [x] 1.2 Implement CSV parsing for `SchemeData.csv` to extract names and ISINs.
- [x] 1.3 Implement grouping logic to group schemes by `Scheme Name` to share holding data.
- [x] 1.4 Implement API fetching from Moneycontrol with rate limiting/delay.
- [x] 1.5 Implement Firestore saving logic to store holdings data in the `holdings` collection.
- [x] 1.6 Add logging for success and error cases (e.g., missing ISIN, API failure).
- [x] 1.7 Perform a trial run with a limited set of schemes to verify data integrity.
