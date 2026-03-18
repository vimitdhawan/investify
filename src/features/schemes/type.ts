import type { Transaction } from '@/features/transactions/type';

export enum SchemeType {
  Equity = 'EQUITY',
  Debt = 'DEBT',
  Hybrid = 'HYBRID',
  Other = 'OTHER',
}

export enum SchemeNavStatus {
  Available = 'AVAILABLE',
  Missing = 'MISSING',
  Stale = 'STALE',
  Pending = 'Pending',
}

export interface SchemeView {
  id: string;
  name: string;
  amfi: string;
  amc: string;
  isin: string;
  folioNumber: string;
  units: number;
  investedAmount: number;
  schemdNavStatus: SchemeNavStatus;
  nav: number;
  lastNavDate: string;
  marketValue?: number;
  absoluteGainLoss?: number;
  absoluteGainLossPercentage?: number;
  realizedGainLoss?: number;
  xirrGainLoss?: number;
  withdrawAmount?: number;
  stampDuty?: number;
  sttTax?: number;
  capitalGainLoss?: number;
}

export interface Scheme {
  id: string;
  name: string;
  amfi: string;
  amc: string;
  isin: string;
  folioNumber: string;
  units: number;
  type: SchemeType;
  investedAmount: number;
  marketValue: number;
  isClosed: boolean;
  latestNavDate: Date;
  nav: number;
  transactions: Transaction[];
  withdrawAmount?: number;
  realizedGainLoss?: number;
  stampDuty?: number;
  sttTax?: number;
  capitalGainTax?: number;
  goalId?: string;
  navStatus: SchemeNavStatus;
  xirrGainLoss?: number;
  absoluteGainLoss?: number;
  absoluteGainLossPercentage?: number;
}

export function generateSchemeId(mutualFundId: string, scheme: Scheme) {
  // Sanitize the inputs to create a consistent and unique ID
  const sanitizedIsin = (scheme.isin ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedAmfi = (scheme.amfi ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${mutualFundId}-${sanitizedIsin}-${sanitizedAmfi}`;
}
