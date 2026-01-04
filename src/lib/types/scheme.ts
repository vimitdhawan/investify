import { TransactionView, Transaction } from '@/lib/types/transaction';

export enum SchemeType {
  Equity = 'EQUITY',
  Debt = 'DEBT',
  Hybrid = 'HYBRID',
}

export interface SchemeView {
  id: string;
  name: string;
  amfi: string;
  amc: string;
  isin: string;
  folioNumber: string;
  units?: number;
  investedAmount: number;
  marketValue?: number;
  absoluteGainLoss?: number;
  absoluteGainLossPercentage?: number;
  nav?: number;
  date?: string;
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
  investedAmount: number;
  isClosed: boolean;
  transactions: Transaction[];
  withdrawAmount?: number;
  realizedGainLoss?: number;
  stampDuty?: number;
  sttTax?: number;
  capitalGainTax?: number;
}

export function generateSchemeId(mutualFundId: string, scheme: Scheme) {
  // Sanitize the inputs to create a consistent and unique ID
  const sanitizedIsin = (scheme.isin ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  const sanitizedAmfi = (scheme.amfi ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  return `${mutualFundId}-${sanitizedIsin}-${sanitizedAmfi}`;
}
