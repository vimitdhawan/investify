import { SchemeView } from '@/features/schemes/type';

export interface MutualFundView {
  name: string;
  folioNumbers: string[];
  investedAmount: number;
  marketValue?: number;
  absoluteGainLoss?: number;
  absoluteGainLossPercentage?: number;
  realizedGainLoss?: number;
  stampDuty?: number;
  xirrGainLoss?: number;
}

export function generateMutualFundId(folioNumber: string, amc: string): string {
  // Sanitize the inputs to create a consistent and unique ID
  const sanitizedFolio = folioNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedAmc = amc.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${sanitizedAmc}-${sanitizedFolio}`;
}
