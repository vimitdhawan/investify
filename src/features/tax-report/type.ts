import type { SchemeType } from '@/features/schemes/type';

export interface RealizedGainDetail {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeType: SchemeType;
  folioNumber: string;
  units: number;
  purchaseDate: Date;
  saleDate: Date;
  purchasePrice: number;
  salePrice: number;
  gainLoss: number;
  holdingPeriodDays: number;
  isLTCG: boolean;
  isSTCG: boolean;
  isDebt: boolean;
  fiscalYear: string; // e.g., "2023-24"
}

export interface GroupedGain {
  schemeName: string;
  folioNumber: string;
  saleDate: Date;
  buyAmount: number;
  sellAmount: number;
  gainLoss: number;
  isLTCG: boolean;
  isSTCG: boolean;
  isDebt: boolean;
}

export interface TaxSummary {
  ltcgGains: number;
  stcgGains: number;
  debtGains: number;
  estimatedTax: number;
}
