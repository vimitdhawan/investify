export interface PortfolioSummary {
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedGainLoss: number;
  xirrGainLoss?: number;
  date: string;
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
}
