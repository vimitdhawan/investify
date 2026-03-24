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

export interface RealizedGainLoss {
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
  // Gains by type (only positive)
  ltcgGains: number;
  stcgGains: number;
  debtGains: number;

  // Losses by type (only negative, stored as positive)
  ltcgLoss: number;
  stcgLoss: number;
  debtLoss: number;

  // Net gains after loss set-off
  netLtcg: number; // LTCG - LTCL
  netStcg: number; // STCG - STCL - excess LTCL
  netDebt: number; // Debt - Debt Loss

  // Taxable amounts after rebate/exemptions
  ltcgTaxable: number; // Max(0, netLtcg - ₹1.25L)
  stcgTaxable: number;
  debtTaxable: number;

  // Calculated taxes
  ltcgTax: number; // 12.5% on ltcgTaxable
  stcgTax: number; // 20% on stcgTaxable
  debtTax: number; // (slab % / 100) on debtTaxable
  totalCalculatedTax: number; // ltcgTax + stcgTax + debtTax

  // Tax already paid
  totalTaxPaid: number; // Sum of capitalGainTax already deducted

  // Net position
  taxDueOrRefund: number; // totalCalculatedTax - totalTaxPaid (positive = due, negative = refund)
  isRefund: boolean; // true if taxDueOrRefund < 0
}
