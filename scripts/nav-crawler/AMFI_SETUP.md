# Setting Up AMFI Data Access

This guide helps you set up access to AMFI NAV data when outside India.

## Quick Start (Manual Upload)

### If you have VPN access to India:

1. **Open VPN to an Indian server**

2. **Download NAVAll.txt:**

   ```bash
   # Using curl
   curl -o ~/Downloads/NAVAll.txt https://www.amfiindia.com/spages/NAVAll.txt

   # Or using wget
   wget -O ~/Downloads/NAVAll.txt https://www.amfiindia.com/spages/NAVAll.txt
   ```

3. **Place in project:**

   ```bash
   mkdir -p temp
   cp ~/Downloads/NAVAll.txt temp/navall-manual.txt
   ```

4. **Run the sync script:**
   ```bash
   npm run nav:sync
   ```

That's it! The script will automatically detect and use the manual file.

---

## Setup Proxy Service (Production)

For automated daily updates, set up a proxy service in India.

### Example: Google Cloud Run Proxy

1. **Create Cloud Run service with this code:**

```typescript
// index.ts
import * as functions from '@google-cloud/functions-framework';

functions.http('amfi-proxy', async (req: any, res: any) => {
  try {
    const response = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`AMFI returned ${response.status}`);
    }

    const text = await response.text();
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'max-age=3600');
    res.send(text);
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
});
```

2. **Deploy to Cloud Run:**

   ```bash
   gcloud functions deploy amfi-proxy \
     --runtime nodejs20 \
     --trigger-http \
     --allow-unauthenticated \
     --region asia-south1 # India region!
   ```

3. **Set environment variable:**
   ```bash
   export AMFI_PROXY_URL="https://YOUR_CLOUD_RUN_URL/amfi-proxy?url="
   npm run nav:sync
   ```

### Example: Vercel Proxy

1. **Create `api/amfi.ts`:**

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const response = await fetch('https://www.amfiindia.com/spages/NAVAll.txt');
    const text = await response.text();
    res.setHeader('Cache-Control', 'max-age=3600');
    res.send(text);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

2. **Deploy:**

   ```bash
   # Just push to GitHub and connect Vercel
   git push
   ```

3. **Note:** Vercel might not work if deployed outside India. Use Cloud Run instead.

---

## Using with Your App

### Automatically detect and use available method:

The script checks in this order:

1. `temp/navall-manual.txt` - if exists, use it
2. `AMFI_PROXY_URL` env var - if set, use proxy
3. `HTTP_PROXY` env var - if set, use proxy
4. Direct fetch - will fail outside India

### Example usage:

```bash
# Method 1: Manual file (fastest, for testing)
cp NAVAll.txt temp/navall-manual.txt
npm run nav:sync

# Method 2: Proxy service (production)
export AMFI_PROXY_URL="https://your-proxy.com/fetch?url="
npm run nav:sync

# Method 3: HTTP proxy
export HTTPS_PROXY="http://proxy-ip:port"
npm run nav:sync
```

---

## Verify Setup

Check if the setup is working:

```bash
# Test manual file
test -f temp/navall-manual.txt && echo "✓ Manual file found" || echo "✗ No manual file"

# Test proxy (if configured)
test -n "$AMFI_PROXY_URL" && echo "✓ Proxy URL: $AMFI_PROXY_URL" || echo "✗ No proxy configured"

# Run sync
npm run nav:sync
```

---

## Troubleshooting

### Manual file method

```bash
# Check file exists and has content
ls -lh temp/navall-manual.txt
head -5 temp/navall-manual.txt

# Should show scheme data like:
# 100010;INF209K01010;INF209K01028;RELIANCE MONEY MANAGER FUND - G;95.61;27-Mar-2026
```

### Proxy method

```bash
# Test if proxy is accessible
curl -v https://your-proxy.com/fetch?url=https://www.amfiindia.com/spages/NAVAll.txt

# Test directly from Cloud Run (if using that)
curl https://YOUR_CLOUD_RUN_URL/amfi-proxy
```

### Check script logs

```bash
# Run with verbose output
npm run nav:sync 2>&1 | grep -E "Using|Fetching|Error"

# Should show which method is being used
```

---

## Cost Estimates

| Method           | Cost            | Notes                                |
| ---------------- | --------------- | ------------------------------------ |
| Manual Upload    | Free            | Manual work, good for testing        |
| Google Cloud Run | ~$0 (free tier) | 2M requests/month free, then $0.40/M |
| Vercel           | Free            | May not work from outside India      |
| Proxy Service    | $5-50/mo        | Residential proxy services           |

**Recommended:** Use Google Cloud Run (free tier) for production.
