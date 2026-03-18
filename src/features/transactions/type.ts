import type { SchemeType } from '@/features/schemes/type';

export enum TransactionType {
  Purchase = 'PURCHASE',
  PurchaseSIP = 'PURCHASE_SIP',
  Redemption = 'REDEMPTION',
  SwitchIn = 'SWITCH_IN',
  SwitchInMerger = 'SWITCH_IN_MERGER',
  SwitchOut = 'SWITCH_OUT',
  SwitchOutMerger = 'SWITCH_OUT_MERGER',
  DividendPayout = 'DIVIDEND_PAYOUT',
  DividendReinvestment = 'DIVIDEND_REINVESTMENT',
  Segregation = 'SEGREGATION',
  StampDutyTax = 'STAMP_DUTY_TAX',
  TdsTax = 'TDS_TAX',
  SttTax = 'STT_TAX',
  Misc = 'MISC',
  REVERSAL = 'REVERSAL',
}

export const investmentTypes = [
  TransactionType.Purchase,
  TransactionType.PurchaseSIP,
  TransactionType.SwitchIn,
  TransactionType.SwitchInMerger,
  TransactionType.DividendReinvestment,
];
export const withdrawTypes = [
  TransactionType.Redemption,
  TransactionType.SwitchOut,
  TransactionType.SwitchOutMerger,
  TransactionType.DividendPayout,
];

export interface TransactionView {
  id: string;
  date: string;
  schemeId: string;
  description: string;
  type: TransactionType;
  nav: number;
  units: number;
  investedAmount?: number;
  actualInvestment?: number;
  stampDuty?: number;
  withdrawAmount?: number;
  sttTax?: number;
  capitalGainTax?: number;
}

export interface Transaction {
  id: string;
  date: Date;
  schemeId: string;
  description: string;
  type: TransactionType;
  nav: number;
  units: number;
  amount: number;
  stampDuty?: number;
  sttTax?: number;
  capitalGainTax?: number;
}

export interface AggregateTransaction {
  units: number;
  investedAmount: number;
  realizedGainLoss: number;
  withdrawAmount: number;
  capitalGainTax: number;
  stampDuty: number;
  sttTax: number;
}

export interface RealizedGainDetail {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeType: SchemeType;
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
