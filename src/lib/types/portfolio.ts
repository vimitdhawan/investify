import { TransactionType, MutualFundType } from "@/lib/types/enums";

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

export interface AdditionalInfoDTO {
  kyc: string;
  name: string;
  pan: string;
  pankyc: string;
}

export interface LinkedHolderDTO {
  name: string;
  pan: string;
}

export interface GainDTO {
  absolute: number;
  percentage: number;
}

export interface TransactionDTO {
  id: string;
  amount: number;
  balance: number | null;
  date: string;
  description: string;
  dividend_rate: number | null;
  nav: number | null;
  type: TransactionType;
  units: number | null;
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
  type: MutualFundType;
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

export interface MutualFundDTO {
  additional_info: AdditionalInfoDTO;
  amc: string;
  folio_number: string;
  linked_holders: LinkedHolderDTO[];
  registrar: string;
  schemes: SchemeDTO[];
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

export interface PortfolioDTO {
  demat_accounts: DematAccountDTO[];
  insurance: InsuranceDTO;
  investor: InvestorDTO;
  meta: MetaDTO;
  mutual_funds: MutualFundDTO[];
  latestNavDate?: string;
}

export interface PortfolioSummary {
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedProfit: number;
}

export interface TransactionView {
  date: string;
  description: string;
  type: TransactionType;
  nav: number | null;
  units: number | null;
  balance: number | null;
  investedAmount?: number;
  actualInvestment?: number;
  stampDuty?: number;
  withdrawAmount?: number;
  sttTax?: number;
  ltcgStcgTax?: number;
}
