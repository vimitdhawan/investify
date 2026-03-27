/**
 * Type definitions for NAV crawler
 */

export interface AmfiNavRecord {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
  nav: string;
  navDate: string;
}

export interface SchemeLatest {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
  nav: string;
  navDate: string;
  updatedAt: FirebaseFirestore.FieldValue;
}

export interface NavHistoryEntry {
  date: string;
  nav: string;
}

export interface SchemeHistory {
  schemeCode: number;
  schemeName: string;
  navHistory: NavHistoryEntry[];
  updatedAt: FirebaseFirestore.FieldValue;
}

export interface IsinMapEntry {
  isin: string;
  schemeCode: number;
  schemeName: string;
}

export interface ParquetNavRecord {
  Scheme_Code: number;
  Date: string;
  NAV: number;
}

export interface ParsedNavLine {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
  nav: string;
  navDate: string;
}
