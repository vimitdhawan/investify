# AMFI Data Access Solution

## Overview

This solution addresses the problem of fetching AMFI NAV data from outside India. AMFI website blocks access based on IP geolocation, making it impossible to automatically fetch data when deployed outside India.

## The Solution: Multi-Method Approach

The implementation provides **4 ways to access AMFI data**, with automatic method detection:

### 1. Manual File Upload (Development/Testing)

**When to use:** Development, testing, occasional imports

**How it works:**

- Download NAVAll.txt from AMFI (via VPN or from India)
- Place in `temp/navall-manual.txt`
- Script automatically detects and uses it

**Setup (2 minutes):**

```bash
# Connect to VPN with Indian server, then:
curl -o temp/navall-manual.txt https://www.amfiindia.com/spages/NAVAll.txt

# Run the script - automatically uses the file
npm run nav:sync
```

### 2. Proxy Service (Production Recommended ⭐)

**When to use:** Automated daily updates, production deployment

**How it works:**

- Deploy a simple proxy service in India
- Proxy fetches from AMFI and relays data
- Script calls your proxy instead of AMFI directly

**Setup with Google Cloud Run (5 minutes):**

1. Deploy function to Cloud Run (India region):

```bash
gcloud functions deploy amfi-proxy \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-south1 # Important: India region!
```

2. Set environment variable:

```bash
export AMFI_PROXY_URL="https://YOUR_CLOUD_RUN_URL/amfi-proxy?url="
```

3. Run the script:

```bash
npm run nav:sync
```

**Cost:** Free (2M requests/month), then $0.40/million requests

**Example proxy code:**

```typescript
import * as functions from '@google-cloud/functions-framework';

functions.http('amfi-proxy', async (req: any, res: any) => {
  try {
    const response = await fetch('https://www.amfiindia.com/spages/NAVAll.txt');
    const text = await response.text();
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'max-age=3600');
    res.send(text);
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
});
```

### 3. HTTP Proxy

**When to use:** You have a proxy service available

**Setup:**

```bash
export HTTPS_PROXY="http://proxy-ip:port"
npm run nav:sync
```

### 4. Direct Fetch (Fallback)

**When to use:** Inside India or on VPN

- Works automatically if you're in India or on VPN
- Includes retry logic (3 attempts)
- Fails gracefully with helpful error messages

## How It Works

The fetch logic automatically tries in this order:

```
1. Check temp/navall-manual.txt exists?
   ├─ YES → Read from file (fastest)
   └─ NO → Continue

2. Check AMFI_PROXY_URL env var set?
   ├─ YES → Use proxy service
   └─ NO → Continue

3. Check HTTP_PROXY/HTTPS_PROXY env var?
   ├─ YES → Use HTTP proxy
   └─ NO → Continue

4. Try direct fetch with retry (3x)
   ├─ SUCCESS → Use it
   └─ FAIL → Show helpful error with setup instructions
```

## Implementation Changes

### Modified Files

1. **config.ts**
   - Added `PROXY_URL` from `AMFI_PROXY_URL` env var
   - Added `MANUAL_NAV_PATH = 'temp/navall-manual.txt'`

2. **utils.ts**
   - Enhanced `fetchWithRetry()` with multi-method logic
   - Checks manual file first (if AMFI URL)
   - Tries proxy service (if configured)
   - Falls back to direct fetch with retry

3. **fetch-nav.ts**
   - Better error messages showing which method is used
   - Clear instructions on how to set up AMFI access
   - Logs indicate which access method is active

4. **README.md**
   - Added comprehensive AMFI access guide
   - Proxy service examples
   - Extended troubleshooting section

5. **AMFI_SETUP.md** (New)
   - Quick start guide
   - Step-by-step examples for each method
   - Cost comparison
   - Verification steps

## Code Example

### Using in your app:

```typescript
import { fetchAmfiNav } from './scripts/nav-crawler/fetch-nav';

// Method 1: Manual file
// Place NAVAll.txt in temp/navall-manual.txt
const navRecords = await fetchAmfiNav(); // Uses file

// Method 2: Proxy service
// export AMFI_PROXY_URL="https://your-proxy.com/fetch?url="
const navRecords = await fetchAmfiNav(); // Uses proxy

// Method 3: HTTP proxy
// export HTTPS_PROXY="http://proxy:port"
const navRecords = await fetchAmfiNav(); // Uses proxy

// The script automatically detects which method to use!
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Sync NAV Data
on:
  schedule:
    - cron: '30 15 * * *' # 9 PM IST daily

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run nav:sync
        env:
          AMFI_PROXY_URL: ${{ secrets.AMFI_PROXY_URL }}
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          # ... other secrets
```

## Cost Comparison

| Method            | Cost      | Setup  | Reliability | Scale     |
| ----------------- | --------- | ------ | ----------- | --------- |
| Manual Upload     | Free      | 5 min  | Manual      | Manual    |
| Cloud Run         | Free tier | 15 min | 99.95%      | 2M/month  |
| Vercel            | Free      | 10 min | 99%         | Limited   |
| Residential Proxy | $5-50/mo  | 5 min  | 95%         | Unlimited |

**Recommendation:** Start with manual upload for testing, move to Cloud Run for production.

## Features

✅ **Automatic Detection** - No code changes needed, just set env vars  
✅ **Clear Error Messages** - Shows which method failed and how to fix it  
✅ **Multiple Access Methods** - Works with VPN, proxy, manual upload  
✅ **Backward Compatible** - No breaking changes to existing code  
✅ **No New Dependencies** - Uses only built-in Node.js features  
✅ **TypeScript Support** - Full type safety maintained  
✅ **Comprehensive Docs** - Step-by-step guides and examples

## Troubleshooting

### "Failed to fetch AMFI NAV data" outside India?

1. **Using manual upload:**

   ```bash
   # Verify file exists
   ls -lh temp/navall-manual.txt

   # Check file has content
   head -3 temp/navall-manual.txt
   ```

2. **Using proxy service:**

   ```bash
   # Verify proxy URL is set
   echo $AMFI_PROXY_URL

   # Test proxy
   curl $AMFI_PROXY_URL
   ```

3. **Using HTTP proxy:**

   ```bash
   # Verify env var
   echo $HTTPS_PROXY

   # Test connectivity
   curl -v https://www.amfiindia.com/
   ```

### Script shows detailed error?

The error message will tell you exactly which method failed and how to set it up. Follow the guidance provided.

## Related Documentation

- **AMFI_SETUP.md** - Quick start guide with step-by-step examples
- **README.md** - Overview and scheduling options
- **config.ts** - Configuration options
- **fetch-nav.ts** - Fetch implementation

## Questions?

1. Check the error message output - it includes setup instructions
2. Read AMFI_SETUP.md for step-by-step guides
3. Read README.md for overview and scheduling
4. Check troubleshooting section above

---

**Version:** 1.0  
**Last Updated:** March 29, 2026  
**Status:** Production Ready ✅
