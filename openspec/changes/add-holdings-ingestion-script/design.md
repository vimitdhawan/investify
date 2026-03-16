## Context

The application needs to enrich mutual fund data with underlying stock holdings and asset allocation metrics. This information is available from the Moneycontrol API but requires an ISIN to fetch. Each scheme variant (Growth, Regular, IDCW) typically shares the same underlying portfolio.

## Goals / Non-Goals

- **Goals**:
  - Build a script to fetch holdings for all ISINs in `SchemeData.csv`.
  - Minimize API calls by grouping related schemes.
  - Store the data in a structured way in Firestore.
- **Non-Goals**:
  - Real-time fetching (this is a one-time or periodic ingestion script).
  - Updating existing portfolio schemes automatically (this script only populates the metadata).

## Decisions

- **ISIN Extraction**: Since ISINs are often concatenated in the CSV (e.g., `INF179K01814INF179K01822`), the script will use a regex (`INF[A-Z0-9]{9}`) to identify all 12-character ISINs in the ISIN-related columns.
- **Grouping/Deduplication**: Schemes with the same `Scheme Name` will be grouped. The script will fetch data for only _one_ primary ISIN in that group and replicate the result for all ISINs in the group.
- **API Fetching**: Use `axios` to call the Moneycontrol `swiftapi`. A delay of 500ms will be added between calls to different scheme families to prevent rate limiting.
- **Moneycontrol API Schema**:
  ```json
  {
    "success": 1,
    "data": [
      {
        "asset_alloc": {
          "equity_alloc": "99.33",
          "bond_alloc": "0.00",
          "cash_alloc": "0.66",
          "other_alloc": "0.00"
        },
        "market_cap_weightage": {
          "large_cap": 81.77,
          "mid_cap": 11.41,
          "small_cap": 0.94,
          "others_cap": 5.88
        },
        "concentration": {
          "number_of_holding": 82,
          "avg_market_cap": "₹3,72,562.44 Cr",
          "top_10_stk_wt": "57.25",
          "top_5_stk_wt": "34.60",
          "top_3_sector_wt": "112.08"
        }
      },
      {
        "stock_holding": [
          {
            "name": "HDFC Bank Ltd",
            "sector": "Financial Services",
            "value": "1110940000.00",
            "weighting": "7.69"
          }
        ]
      }
    ]
  }
  ```
- **Firestore Schema**: A new top-level collection `holdings` will store the portfolio data. Each document ID will be the ISIN.
  - `asset_alloc`: Object with equity, bond, cash, and other allocation.
  - `market_cap_weightage`: Object with large, mid, and small cap weightage.
  - `concentration`: Object with holding counts and top stock/sector weights.
  - `stock_holding`: Array of stock objects (name, sector, value, weighting).

## Alternatives Considered

- Fetching by ISIN directly: Dismissed due to high API call volume and redundant data (each scheme has multiple ISINs for payout/reinvestment).
- Using a different API: Moneycontrol was chosen as it's the specific source requested and provides high-quality data.

## Risks / Trade-offs

- **API Changes**: If Moneycontrol changes their API endpoint or structure, the script will need updates.
- **ISIN Mismatch**: If an ISIN in a group doesn't match the portfolio fetched for the primary ISIN, the data might be slightly off (though rare for mutual funds).
- **Rate Limiting**: Even with delays, high-volume requests could lead to temporary IP blocking.

## Open Questions

- None at this stage; the source and destination are clearly defined.
