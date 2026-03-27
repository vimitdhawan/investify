/**
 * Configuration for NAV crawler
 */

export const AMFI_CONFIG = {
  // AMFI NAV data URL - updated daily around 8-9 PM IST
  NAV_ALL_URL: 'https://www.amfiindia.com/spages/NAVAll.txt',

  // GitHub repository for historical data
  GITHUB_PARQUET_URL:
    'https://github.com/InertExpert2911/Mutual_Fund_Data/raw/main/mutual_fund_nav_history.parquet',

  // Request timeout
  TIMEOUT_MS: 30000,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
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
