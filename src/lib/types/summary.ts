export interface FundHouseSummary {
  amc: string;
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedProfit: number;
}

export interface SchemeSummary {
  amc: string;
  schemeName: string;
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedProfit: number;
}
