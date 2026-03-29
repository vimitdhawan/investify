/**
 * Parser for AMFI NAVAll.txt file
 */
import { PARSER_CONFIG } from './config';
import type { ParsedNavLine } from './types';
import { isValidSchemeCode, normalizeIsin } from './utils';

/**
 * Parse a single line from NAVAll.txt
 * Format: Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
 * Example: 100033;INF209K01165;-;Aditya Birla Sun Life Fund - Growth;812.59;27-Mar-2026
 */
export function parseNavLine(line: string): ParsedNavLine | null {
  // Skip empty lines
  if (!line || line.trim() === '') {
    return null;
  }

  const parts = line.split(PARSER_CONFIG.DELIMITER);

  // Skip if doesn't have expected columns
  if (parts.length < PARSER_CONFIG.EXPECTED_COLUMNS) {
    return null;
  }

  const schemeCodeStr = parts[PARSER_CONFIG.COLUMNS.SCHEME_CODE]?.trim();

  // Skip AMC header lines (non-numeric scheme codes)
  if (PARSER_CONFIG.SKIP_NON_NUMERIC_CODE && !isValidSchemeCode(schemeCodeStr)) {
    return null;
  }

  const schemeCode = parseInt(schemeCodeStr, 10);
  const isinGrowth = normalizeIsin(parts[PARSER_CONFIG.COLUMNS.ISIN_GROWTH]);
  const isinDivReinvestment = normalizeIsin(parts[PARSER_CONFIG.COLUMNS.ISIN_DIV]);
  const schemeName = parts[PARSER_CONFIG.COLUMNS.SCHEME_NAME]?.trim();
  const nav = parts[PARSER_CONFIG.COLUMNS.NAV]?.trim();
  const navDate = parts[PARSER_CONFIG.COLUMNS.DATE]?.trim();

  // Validate required fields
  if (!schemeCode || !schemeName || !nav || !navDate) {
    return null;
  }

  return {
    schemeCode,
    schemeName,
    isinGrowth,
    isinDivReinvestment,
    nav,
    navDate,
  };
}

/**
 * Parse entire NAVAll.txt content
 */
export function parseNavAllText(text: string): ParsedNavLine[] {
  const lines = text.split('\n');
  const results: ParsedNavLine[] = [];

  for (const line of lines) {
    const parsed = parseNavLine(line);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Group NAV records by scheme code
 */
export function groupBySchemeCode(records: ParsedNavLine[]): Map<number, ParsedNavLine> {
  const map = new Map<number, ParsedNavLine>();

  for (const record of records) {
    map.set(record.schemeCode, record);
  }

  return map;
}
