import { MutualFundView } from '@/features/fund-houses/type';
import { Scheme } from '@/features/schemes/type';

export interface PortfolioView {
  investor: InvestorView;
  statementPeriods: StatementPeriodView[];
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedGainLoss: number;
  mutualFunds: MutualFundView[];
  date: string;
  xirrGainLoss?: number;
}

interface InvestorView {
  address: string;
  email: string;
  mobile: string;
  name: string;
  pan: string;
}

interface StatementPeriodView {
  from: string;
  to: string;
}

export interface StatementPeriod {
  from: string;
  to: string;
}

export interface Investor {
  address: string;
  email: string;
  mobile: string;
  name: string;
  pan: string;
}

export interface Statement {
  period: StatementPeriod;
}

export interface Portfolio {
  investor: Investor;
  statements: Statement[];
  schemes: Scheme[];
}
