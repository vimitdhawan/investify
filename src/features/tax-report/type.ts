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
  taxPaid: number; // capitalGainTax from the sale transaction
}

export interface GroupedGain {
  schemeName: string;
  folioNumber: string;
  saleDate: Date;
  buyAmount: number;
  sellAmount: number;
  gainLoss: number;
  taxPaid: number; // Sum of tax paid for grouped transactions
  isLTCG: boolean;
  isSTCG: boolean;
  isDebt: boolean;
}

export interface TaxSummary {
  // Gains by type
  ltcgGains: number;
  stcgGains: number;
  debtGains: number;

  // Calculated taxes
  ltcgTax: number; // 12.5% on (ltcgGains - ₹1.25L)
  stcgTax: number; // 20% on stcgGains
  debtTax: number; // (slab % / 100) on debtGains
  totalCalculatedTax: number; // ltcgTax + stcgTax + debtTax

  // Tax already paid
  totalTaxPaid: number; // Sum of capitalGainTax already deducted

  // Net position
  taxDueOrRefund: number; // totalCalculatedTax - totalTaxPaid (positive = due, negative = refund)
  isRefund: boolean; // true if taxDueOrRefund < 0
}
