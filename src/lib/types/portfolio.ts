
export interface Investor {
  address: string;
  cas_id: string | null;
  email: string;
  mobile: string;
  name: string;
  pan: string | null;
  pincode: string | null;
}

export interface StatementPeriod {
  from: string;
  to: string;
}

export interface Meta {
  cas_type: string;
  generated_at: string;
  statement_period: StatementPeriod;
}

export interface AdditionalInfo {
  kyc: string;
  name: string;
  pan: string;
  pankyc: string;
}

export interface LinkedHolder {
  name: string;
  pan: string;
}

export interface Gain {
  absolute: number;
  percentage: number;
}

export interface Transaction {
  amount: number;
  balance: number | null;
  date: string;
  description: string;
  dividend_rate: number | null;
  nav: number | null;
  type: string;
  units: number | null;
}

export interface Scheme {
  additional_info: SchemeAdditionalInfo;
  cost: number;
  gain: Gain;
  isin: string;
  name: string;
  nav: number;
  nominees: string[];
  transactions: Transaction[];
  type: string;
  units: number;
  value: number;
  avgNav?: number;
}

export interface SchemeAdditionalInfo {
    advisor: string;
    amfi: string;
    close_units: number;
    open_units: number;
    rta: string;
    rta_code: string;
}

export interface MutualFund {
  additional_info: AdditionalInfo;
  amc: string;
  folio_number: string;
  linked_holders: LinkedHolder[];
  registrar: string;
  schemes: Scheme[];
}

export interface DematAccount {
    // Define properties for DematAccount if any
}

export interface LifeInsurancePolicy {
    // Define properties for LifeInsurancePolicy if any
}

export interface Insurance {
    life_insurance_policies: LifeInsurancePolicy[];
}

export interface Portfolio {
  demat_accounts: DematAccount[];
  insurance: Insurance;
  investor: Investor;
  meta: Meta;
  mutual_funds: MutualFund[];
}

export interface PortfolioSummary {
  investedValue: number;
  marketValue: number;
  absoluteGainLoss: number;
  absoluteGainLossPercentage: number;
  realizedProfit: number;
}
