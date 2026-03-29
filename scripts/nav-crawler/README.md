# NAV Crawler

A self-hosted NAV (Net Asset Value) data pipeline for Indian Mutual Funds that fetches data directly from AMFI, eliminating dependency on external APIs.

## Overview

This crawler system consists of two main scripts:

1. **Historical Import** (`import-historical.ts`) - One-time script to backfill historical NAV data
2. **Daily Sync** (`index.ts`) - Daily script to fetch and update latest NAV data from AMFI

## Architecture

```
AMFI Website (NAVAll.txt) → Parser → Firestore Collections
                                          ├── mf_schemes_latest
                                          ├── mf_schemes_history
                                          └── mf_isin_map
```

## Firestore Collections

### 1. `mf_schemes_latest`

Stores the latest NAV for each scheme.

```typescript
{
  schemeCode: 100033,
  schemeName: "Aditya Birla Sun Life Fund - Growth",
  isinGrowth: "INF209K01165",
  isinDivReinvestment: null,
  nav: "812.59",
  navDate: "27-Mar-2026",
  updatedAt: Timestamp
}
```

### 2. `mf_schemes_history`

Stores historical NAV data as an array.

```typescript
{
  schemeCode: 100033,
  schemeName: "Aditya Birla Sun Life Fund - Growth",
  navHistory: [
    { date: "25-Mar-2026", nav: "810.25" },
    { date: "26-Mar-2026", nav: "811.50" },
    { date: "27-Mar-2026", nav: "812.59" }
  ],
  updatedAt: Timestamp
}
```

### 3. `mf_isin_map`

Maps ISIN codes to scheme codes for fast lookups.

```typescript
{
  isin: "INF209K01165",
  schemeCode: 100033,
  schemeName: "Aditya Birla Sun Life Fund - Growth"
}
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install `parquetjs` which is required for historical import.

### 2. Configure Environment

Make sure your `.env.local` has Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_STORAGE_BUCKET=your-bucket
```

## Usage

### One-Time Historical Import

Run this once to backfill historical NAV data from the GitHub Parquet file:

```bash
npm run nav:import
```

**What it does:**

1. Downloads ~500MB parquet file from GitHub (InertExpert2911/Mutual_Fund_Data)
2. Parses 20M+ historical NAV records
3. Groups by scheme code
4. Enriches with scheme names from AMFI
5. Bulk imports to Firestore `mf_schemes_history`
6. Syncs latest NAV to `mf_schemes_latest`

**Time:** ~15-30 minutes depending on network and Firestore quota

**Note:** The parquet file is saved in `temp/` directory and can be deleted after import.

### Daily NAV Sync

Run this daily to fetch and update latest NAV data from AMFI:

```bash
npm run nav:sync
```

**What it does:**

1. Fetches `NAVAll.txt` from AMFI website
2. Parses ~16,000 scheme records
3. Checks for new data (skips if navDate is same)
4. Updates `mf_schemes_latest` with new NAV
5. Appends new NAV to `mf_schemes_history`
6. Updates `mf_isin_map` for any new ISINs

**Time:** ~2-5 minutes

**Schedule:** Run daily after 9 PM IST (when AMFI updates their data)

## Scheduling Options

### Option 1: Manual (Current)

Run manually when needed:

```bash
npm run nav:sync
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/sync-nav.yml`:

```yaml
name: Sync NAV Data

on:
  schedule:
    - cron: '30 15 * * *' # 9 PM IST daily
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run nav:sync
        env:
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
          FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
          FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
```

### Option 3: Vercel Cron

Deploy as serverless function with cron trigger.

### Option 4: Cloud Run

Deploy as scheduled Cloud Run job.

## Data Sources

### AMFI NAVAll.txt

- **URL:** https://www.amfiindia.com/spages/NAVAll.txt
- **Format:** Semicolon-delimited text
- **Updated:** Daily around 8-9 PM IST
- **Size:** ~2-3 MB
- **Records:** ~16,000 schemes

**⚠️ Note:** AMFI blocks access from outside India. Use one of the methods below to fetch the data.

### Accessing AMFI Data from Outside India

AMFI restricts access to their website based on IP location. If you're outside India, you have 3 options:

#### Option 1: Manual Upload (Recommended for Testing)

**Steps:**

1. Connect to VPN with an Indian server (or access from India)
2. Download NAVAll.txt from https://www.amfiindia.com/spages/NAVAll.txt
3. Place the file in: `temp/navall-manual.txt`
4. Run the sync script - it will automatically use the manual file

```bash
# The script will detect and use temp/navall-manual.txt
npm run nav:sync
```

**Pros:** Simple, works anywhere, no infrastructure needed  
**Cons:** Manual process, needs to be done regularly

#### Option 2: Proxy Service (Recommended for Production)

**Concept:** Set up a simple proxy server in India that fetches from AMFI and relays to your app.

**Steps:**

1. Deploy a simple proxy service in India (Cloud Run, AWS Lambda, Vercel, etc.)
2. Proxy service code example:

```typescript
// Simple proxy endpoint
export async function handler(req, res) {
  const url = 'https://www.amfiindia.com/spages/NAVAll.txt';
  const response = await fetch(url);
  const data = await response.text();
  res.send(data);
}
```

3. Set environment variable:

```bash
export AMFI_PROXY_URL="https://your-proxy-service.com/fetch?url="
npm run nav:sync
```

**Pros:** Automated, production-ready, works reliably  
**Cons:** Need to deploy proxy service, small cost

**Popular Proxy Hosting Options:**

- Google Cloud Run (free tier available)
- AWS Lambda (free tier: 1M requests/month)
- Vercel (free deployment)
- Railway (easy deployment)

#### Option 3: HTTP Proxy (If you have a proxy)

**Steps:**

1. Get an HTTP proxy that can access Indian websites (residential proxy service)
2. Set environment variables:

```bash
# For HTTP requests
export HTTP_PROXY="http://proxy-ip:port"

# For HTTPS requests
export HTTPS_PROXY="http://proxy-ip:port"

# Run the script
npm run nav:sync
```

**Services:**

- Bright Data (residential proxies)
- Smartproxy
- Oxylabs
- Quora proxy

**Pros:** Works with any HTTP request  
**Cons:** Costs money, might be slow

#### Option 4: Deploy in India

Deploy the entire script/service in India (Cloud Run, EC2, etc.) so it has direct access to AMFI.

**Pros:** Fastest, most reliable  
**Cons:** Need to run service in India

### GitHub Parquet (Historical)

- **URL:** https://github.com/InertExpert2911/Mutual_Fund_Data
- **File:** mutual_fund_nav_history.parquet
- **Size:** ~500 MB
- **Records:** 20M+ NAV entries

## Firestore Quotas

**Free Tier:**

- Storage: 1 GB (we use ~500 MB)
- Reads: 50k/day (sufficient with caching)
- Writes: 20k/day (16k daily updates + buffer)

**Cost Estimate (if exceeding free tier):**

- ~$0.01/day for daily sync

## Troubleshooting

### "Permission denied" or "Failed to fetch AMFI NAV data"

**If you see this error when running outside India:**

1. **Check if you're using manual upload:**

   ```bash
   # Make sure temp/navall-manual.txt exists with AMFI data
   ls -la temp/navall-manual.txt
   ```

2. **If using proxy, verify the proxy URL:**

   ```bash
   # Set and test the proxy URL
   export AMFI_PROXY_URL="https://your-proxy.com/fetch?url="
   echo $AMFI_PROXY_URL
   ```

3. **If using HTTP proxy, test connectivity:**

   ```bash
   export HTTPS_PROXY="http://proxy-ip:port"
   curl -v https://www.amfiindia.com/spages/NAVAll.txt
   ```

4. **Error details will show which method failed:**
   - If temp file error → use manual upload
   - If proxy error → check AMFI_PROXY_URL
   - If direct fetch error → use one of the above methods

### Import fails with "Too many writes"

- Firestore free tier has 20k writes/day limit
- Historical import may hit this limit
- Solution: Run import in smaller batches or upgrade to paid tier

### "navHistory array too large" error

- Some old schemes may exceed 1MB Firestore document limit
- Solution: Migrate to subcollections (future enhancement)

### AMFI website timeout

- AMFI website can be slow or down
- Retry logic is built-in (3 retries with backoff)
- Run again later if fails

### Script shows multiple fetch attempts

- This is normal - the script tries multiple access methods:
  1. Manual upload file (`temp/navall-manual.txt`)
  2. Proxy service (if `AMFI_PROXY_URL` set)
  3. HTTP proxy (if `HTTP_PROXY`/`HTTPS_PROXY` set)
  4. Direct fetch (will fail outside India)
- Check logs to see which method is being used

## File Structure

```
scripts/nav-crawler/
├── README.md                  # This file
├── config.ts                  # Configuration (URLs, Firestore paths)
├── types.ts                   # TypeScript type definitions
├── utils.ts                   # Utility functions (fetch, progress, etc.)
├── parse-nav.ts               # AMFI NAVAll.txt parser
├── fetch-nav.ts               # Fetch NAV from AMFI
├── sync-firestore.ts          # Firestore sync operations
├── index.ts                   # Daily crawler entry point
└── import-historical.ts       # One-time historical import
```

## Modified Application Code

The following application code was updated to use Firestore instead of external API:

- `src/lib/clients/mf.ts` - All three functions now read from Firestore:
  - `getLatestNavBySchemeId()` → reads from `mf_schemes_latest`
  - `getHistoricalNavBySchemeId()` → reads from `mf_schemes_history`
  - `getAmficCodeByIsin()` → reads from `mf_isin_map`

Old implementations using external API are commented out for reference.

## Future Enhancements

1. **Subcollections for history** - Handle schemes with >10 years data
2. **Metadata enrichment** - Add AMC, category, scheme type, AUM
3. **Incremental import** - Import historical data in batches
4. **Data validation** - Verify NAV values for anomalies
5. **Alerting** - Notify if sync fails
6. **Performance metrics** - Track sync time, failure rates

## Support

For issues or questions:

1. Check Firestore logs in Firebase Console
2. Check script output for error messages
3. Verify AMFI website is accessible
4. Check Firebase quotas and billing
