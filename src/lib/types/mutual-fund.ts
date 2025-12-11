import {SchemeDTO, Scheme} from "@/lib/types/scheme"

export interface MutualFundInfoDTO {
  kyc: string;
  name: string;
  pan: string;
  pankyc: string;
}

export interface LinkedHolderDTO {
  name: string;
  pan: string;
}

export interface MutualFundDTO {
  additional_info: MutualFundInfoDTO;
  amc: string;
  folio_number: string;
  linked_holders: LinkedHolderDTO[];
  registrar: string;
  schemes: SchemeDTO[];
}

export interface MutualFund {
  name: string;
  folioNumber: string;
  investedAmount: number;
  marketValue?: number;
  absoluteGainLoss?: number;
  absoluteGainLossPercentage?: number;
  realizedGainLoss?: number;

}
