#!/usr/bin/env tsx
/**
 * Test script to verify NAV parser works correctly
 */
import { parseNavLine } from './parse-nav';

// Sample lines from AMFI NAVAll.txt
const sampleLines = [
  // Valid scheme with both ISINs
  '100033;INF209K01165;INF209K01173;Aditya Birla Sun Life Fund - Growth;812.59;27-Mar-2026',

  // Valid scheme with only growth ISIN (div is "-")
  '100034;INF209K01181;-;Aditya Birla Sun Life Fund - Dividend;45.67;27-Mar-2026',

  // AMC header line (should be skipped)
  'ICICI Prudential Mutual Fund',

  // Empty line (should be skipped)
  '',

  // Scheme with missing data (should be skipped)
  '100035;INF209K01199;;Invalid Scheme;;27-Mar-2026',
];

console.log('Testing NAV Parser...\n');

for (const line of sampleLines) {
  console.log('Input:', line);
  const parsed = parseNavLine(line);

  if (parsed) {
    console.log('✓ Parsed:', JSON.stringify(parsed, null, 2));
  } else {
    console.log('✗ Skipped (invalid/header)');
  }
  console.log('---');
}

console.log('\nParser test completed!');
