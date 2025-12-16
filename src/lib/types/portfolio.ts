import { MutualFund, MutualFundDTO } from "@/lib/types/mutual-fund";
export interface PortfolioDTO {
  demat_accounts: DematAccountDTO[];
  insurance: InsuranceDTO;
  investor: InvestorDTO;
  meta: MetaDTO;
  mutual_funds: MutualFundDTO[];
  latestNavDate?: string;
}

interface InvestorDTO {
  address: string;
  cas_id: string | null;
  email: string;
  mobile: string;
  name: string;
  pan: string | null;
  pincode: string | null;
}

interface StatementPeriodDTO {
  from: string;
  to: string;
}

interface MetaDTO {
  cas_type: string;
  generated_at: string;
  statement_period: StatementPeriodDTO;
}

interface DematAccountDTO {
    // Define properties for DematAccount if any
}

interface LifeInsurancePolicyDTO {
    // Define properties for LifeInsurancePolicy if any
}

interface InsuranceDTO {
    life_insurance_policies: LifeInsurancePolicyDTO[];
}

export interface Portfolio {
  investor: Investor;
  statementPeriod: StatementPeriod;
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedGainLoss: number;
  mutualFunds: MutualFund[]
  date: string;
}

interface Investor {
  address: string;
  email: string;
  mobile: string;
  name: string;
  pan: string;
}

interface StatementPeriod {
  from: string;
  to: string;
}
