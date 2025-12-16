import { Transaction, TransactionDTO } from "@/lib/types/transaction";

export enum SchemeType {
  Equity = "EQUITY",
  Debt = "DEBT",
  Hybrid = "HYBRID",
}

export interface GainDTO {
  absolute: number;
  percentage: number;
}

export interface SchemeDTO {
  additional_info: SchemeAdditionalInfoDTO;
  cost: number;
  gain: GainDTO;
  isin: string;
  name: string;
  nav: number;
  nominees: string[];
  transactions: TransactionDTO[];
  type: SchemeType;
  units: number;
  value: number;
  avgNav?: number;
  schemeCode?: string;
  latestNavDate?: string;
}

export interface SchemeAdditionalInfoDTO {
    advisor: string;
    amfi: string;
    close_units: number;
    open_units: number;
    rta: string;
    rta_code: string;
}

export interface Scheme {
    id: string;
    name: string;
    amfi: string;
    amc: string;
    isin: string;
    folioNumber: string;
    mutualFundId: string;
    units?: number;
    investedAmount: number;
    marketValue?: number;
    absoluteGainLoss?: number;
    absoluteGainLossPercentage?: number
    nav?: number;
    date?: string; 
    realizedGainLoss?: number;
    xirrGainLoss?: number;
    withdrawAmount?: number;
    transactions: Transaction[];
}

export function generateSchemeId(mutualFundId: string, dto: SchemeDTO) {
     // Sanitize the inputs to create a consistent and unique ID
  const sanitizedIsin = (dto.isin ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedAmfi = (dto.additional_info?.amfi ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${mutualFundId}-${sanitizedIsin}-${sanitizedAmfi}`;

}

