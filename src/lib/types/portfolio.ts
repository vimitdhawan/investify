import { MutualFund, MutualFundDTO } from "@/lib/types/mutual-fund";
export interface PortfolioDTO {
  demat_accounts: DematAccountDTO[];
  insurance: InsuranceDTO;
  investor: InvestorDTO;
  meta: MetaDTO;
  mutual_funds: MutualFundDTO[];
  latestNavDate?: string;
}

export interface InvestorDTO {
  address: string;
  cas_id: string | null;
  email: string;
  mobile: string;
  name: string;
  pan: string | null;
  pincode: string | null;
}

export interface StatementPeriodDTO {
  from: string;
  to: string;
}

export interface MetaDTO {
  cas_type: string;
  generated_at: string;
  statement_period: StatementPeriodDTO;
}

export interface DematAccountDTO {
    // Define properties for DematAccount if any
}

export interface LifeInsurancePolicyDTO {
    // Define properties for LifeInsurancePolicy if any
}

export interface InsuranceDTO {
    life_insurance_policies: LifeInsurancePolicyDTO[];
}

export interface PortfolioSummary {
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedProfit: number;
}

export interface Portfolio {
  investor: Investor;
  mutualFunds: MutualFund[];
  statementPeriod: StatementPeriod;
}

export interface Investor {
  address: string;
  email: string;
  mobile: string;
  name: string;
  pan: string;
}

export interface StatementPeriod {
  from: string;
  to: string;
}
