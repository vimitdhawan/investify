/**
 * Fetch NAV data from AMFI website
 * Supports multiple methods for accessing AMFI data when blocked outside India
 */
import * as fs from 'fs';

import { AMFI_CONFIG } from './config';
import { parseNavAllText } from './parse-nav';
import type { ParsedNavLine } from './types';
import { fetchWithRetry, formatTimestamp } from './utils';

/**
 * Fetch and parse NAVAll.txt from AMFI
 * Tries multiple access methods:
 * 1. Manual file upload (temp/navall-manual.txt)
 * 2. Proxy service (AMFI_PROXY_URL env var)
 * 3. HTTP proxy (HTTP_PROXY/HTTPS_PROXY env vars)
 * 4. Direct fetch (if accessible from your location)
 */
export async function fetchAmfiNav(): Promise<ParsedNavLine[]> {
  console.log(`[${formatTimestamp()}] Fetching NAV data from AMFI...`);

  // Check which access method will be used
  if (fs.existsSync(AMFI_CONFIG.MANUAL_NAV_PATH)) {
    console.log(`[${formatTimestamp()}] ℹ Will use manual upload: ${AMFI_CONFIG.MANUAL_NAV_PATH}`);
  } else if (AMFI_CONFIG.PROXY_URL) {
    console.log(`[${formatTimestamp()}] ℹ Will use proxy service: ${AMFI_CONFIG.PROXY_URL}`);
  } else if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    console.log(
      `[${formatTimestamp()}] ℹ Will use HTTP proxy: ${process.env.HTTP_PROXY || process.env.HTTPS_PROXY}`
    );
  } else {
    console.log(`[${formatTimestamp()}] URL: ${AMFI_CONFIG.NAV_ALL_URL}`);
    console.log(`[${formatTimestamp()}] ⚠️  Direct access (may fail if outside India)`);
  }

  try {
    const text = await fetchWithRetry(AMFI_CONFIG.NAV_ALL_URL);

    console.log(`[${formatTimestamp()}] Downloaded ${text.length} bytes`);

    const records = parseNavAllText(text);

    console.log(`[${formatTimestamp()}] Parsed ${records.length} scheme records`);

    return records;
  } catch (error: any) {
    console.error(`[${formatTimestamp()}] Failed to fetch AMFI NAV data:`, error.message);
    console.error(`[${formatTimestamp()}]`);
    console.error(`[${formatTimestamp()}] To fix this, use one of these methods:`);
    console.error(`[${formatTimestamp()}]`);
    console.error(`[${formatTimestamp()}] 1. MANUAL UPLOAD (Recommended for now):`);
    console.error(
      `[${formatTimestamp()}]    - Download NAVAll.txt from https://www.amfiindia.com/spages/NAVAll.txt (from India/VPN)`
    );
    console.error(`[${formatTimestamp()}]    - Place it in: ${AMFI_CONFIG.MANUAL_NAV_PATH}`);
    console.error(`[${formatTimestamp()}]    - Re-run the script`);
    console.error(`[${formatTimestamp()}]`);
    console.error(`[${formatTimestamp()}] 2. PROXY SERVICE:`);
    console.error(
      `[${formatTimestamp()}]    - Set: export AMFI_PROXY_URL="https://your-proxy.com/fetch?url="`
    );
    console.error(`[${formatTimestamp()}]    - Deploy a proxy in India that fetches from AMFI`);
    console.error(`[${formatTimestamp()}]`);
    console.error(`[${formatTimestamp()}] 3. HTTP PROXY:`);
    console.error(
      `[${formatTimestamp()}]    - Set: export HTTPS_PROXY="http://your-proxy:port" or HTTP_PROXY`
    );
    console.error(
      `[${formatTimestamp()}]    - Use a proxy service that can access Indian websites`
    );
    console.error(`[${formatTimestamp()}]`);
    throw error;
  }
}
