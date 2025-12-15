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
  id: string;
  name: string;
  folioNumber: string;
  investedAmount: number;
  marketValue?: number;
  absoluteGainLoss?: number;
  absoluteGainLossPercentage?: number;
  realizedGainLoss?: number;
  schemes: Scheme[];
}

export function generateMutualFundId(dto: MutualFundDTO): string {
  // Sanitize the inputs to create a consistent and unique ID
  const sanitizedFolio = dto.folio_number.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedAmc = dto.amc.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${sanitizedAmc}-${sanitizedFolio}`;
}
