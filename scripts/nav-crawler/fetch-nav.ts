/**
 * Fetch NAV data from AMFI website
 */
import { AMFI_CONFIG } from './config';
import { parseNavAllText } from './parse-nav';
import { ParsedNavLine } from './types';
import { fetchWithRetry, formatTimestamp } from './utils';

/**
 * Fetch and parse NAVAll.txt from AMFI
 */
export async function fetchAmfiNav(): Promise<ParsedNavLine[]> {
  console.log(`[${formatTimestamp()}] Fetching NAV data from AMFI...`);
  console.log(`[${formatTimestamp()}] URL: ${AMFI_CONFIG.NAV_ALL_URL}`);

  try {
    const text = await fetchWithRetry(AMFI_CONFIG.NAV_ALL_URL);

    console.log(`[${formatTimestamp()}] Downloaded ${text.length} bytes`);

    const records = parseNavAllText(text);

    console.log(`[${formatTimestamp()}] Parsed ${records.length} scheme records`);

    return records;
  } catch (error: any) {
    console.error(`[${formatTimestamp()}] Failed to fetch AMFI NAV data:`, error.message);
    throw error;
  }
}
