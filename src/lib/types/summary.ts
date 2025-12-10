import { PortfolioSummary } from "./portfolio";

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
  isin: string;
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedProfit: number;
  folio_number: string;
  latestNavDate?: string;
  navValue?: number;
  totalAvailableUnits?: number;
  withdrawalAmount?: number;
  prevDayNavValue?: number;
  prevDayChangePercentage?: number;
}

export interface DashboardSummary extends PortfolioSummary {
    latestNavDate?: string;
    prevDayValue?: number;
    prevDayChange?: number;
    prevDayChangePercentage?: number;
}
