/**
 * Configuration for NAV crawler
 */

export const AMFI_CONFIG = {
  // AMFI NAV data URL - updated daily around 8-9 PM IST
  // NOTE: This URL is blocked outside India. Use one of these alternatives:
  // Option 1: Manual upload - place NAVAll.txt in temp/navall-manual.txt
  // Option 2: Proxy service - set AMFI_PROXY_URL environment variable
  // Option 3: HTTP proxy - set HTTP_PROXY or HTTPS_PROXY environment variable
  NAV_ALL_URL: 'https://www.amfiindia.com/spages/NAVAll.txt',

  // GitHub repository for historical data
  GITHUB_PARQUET_URL:
    'https://github.com/InertExpert2911/Mutual_Fund_Data/raw/main/mutual_fund_nav_history.parquet',

  // Request timeout
  TIMEOUT_MS: 30000,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,

  // Proxy URL for fetching AMFI data (set via environment variable)
  // Example: AMFI_PROXY_URL=https://your-proxy-service.com/fetch?url=
  PROXY_URL: process.env.AMFI_PROXY_URL,

  // Manual upload path for testing without internet access
  MANUAL_NAV_PATH: 'temp/navall-manual.txt',
};

export const FIRESTORE_CONFIG = {
  // Collection names
  COLLECTION_LATEST: 'mf_schemes_latest',
  COLLECTION_HISTORY: 'mf_schemes_history',
  COLLECTION_ISIN_MAP: 'mf_isin_map',

  // Batch size (Firestore limit is 500)
  BATCH_SIZE: 500,
};

export const PARSER_CONFIG = {
  // NAVAll.txt is semicolon-delimited
  DELIMITER: ';',

  // Expected column count
  EXPECTED_COLUMNS: 6,

  // Column indices
  COLUMNS: {
    SCHEME_CODE: 0,
    ISIN_GROWTH: 1,
    ISIN_DIV: 2,
    SCHEME_NAME: 3,
    NAV: 4,
    DATE: 5,
  },

  // Value representing null/missing ISIN
  NULL_ISIN: '-',

  // Skip lines that look like AMC headers (no scheme code)
  SKIP_NON_NUMERIC_CODE: true,
};
