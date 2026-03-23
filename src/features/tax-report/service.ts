import { SchemeType } from '@/features/schemes/type';
import { type Transaction, investmentTypes, withdrawTypes } from '@/features/transactions/type';

import { getFiscalYear } from '@/lib/utils/date';

import { type RealizedGainDetail } from './type';

/**
 * Calculates detailed realized gains using FIFO logic.
 */
export function calculateRealizedGainsDetailed(
  transactions: Transaction[],
  schemeId: string,
  schemeName: string,
  schemeType: SchemeType,
  folioNumber: string
): RealizedGainDetail[] {
  const realizedGains: RealizedGainDetail[] = [];

  const purchases = transactions
    .filter((t) => investmentTypes.includes(t.type) && t.units > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => ({
      ...p,
      remainingUnits: p.units,
    }));

  const sales = transactions
    .filter((t) => withdrawTypes.includes(t.type))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const sale of sales) {
    let unitsToSell = Math.abs(sale.units);
    const salePricePerUnit = sale.nav;

    for (const purchase of purchases) {
      if (unitsToSell <= 0) break;

      if (purchase.remainingUnits > 0) {
        const unitsToProcess = Math.min(unitsToSell, purchase.remainingUnits);
        const gainLoss = unitsToProcess * (salePricePerUnit - purchase.nav);

        // Holding period in days
        const diffTime = sale.date.getTime() - purchase.date.getTime();
        const holdingPeriodDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Taxation logic
        // Default to Debt if type is missing or not Equity/Hybrid
        const isDebt = schemeType === SchemeType.Other || schemeType === SchemeType.Debt;
        const isLTCG = !isDebt && holdingPeriodDays > 365;
        const isSTCG = !isDebt && !isLTCG;

        realizedGains.push({
          id: `${sale.id}-${purchase.id}`,
          schemeId,
          schemeName,
          schemeType,
          folioNumber,
          units: unitsToProcess,
          purchaseDate: purchase.date,
          saleDate: sale.date,
          purchasePrice: purchase.nav,
          salePrice: sale.nav,
          gainLoss,
          holdingPeriodDays,
          isLTCG,
          isSTCG,
          isDebt,
          fiscalYear: getFiscalYear(sale.date),
        });

        purchase.remainingUnits -= unitsToProcess;
        unitsToSell -= unitsToProcess;
      }
    }
  }

  return realizedGains;
}

/**
 * Filters realized gains by fiscal year
 */
export function filterGainsByFiscalYear(
  gains: RealizedGainDetail[],
  fiscalYear: string
): RealizedGainDetail[] {
  return gains.filter((g) => g.fiscalYear === fiscalYear);
}

/**
 * Calculates tax summary from realized gains
 */
export function calculateTaxSummary(
  gains: RealizedGainDetail[],
  taxSlabPercentage: number
): {
  ltcgGains: number;
  stcgGains: number;
  debtGains: number;
  estimatedTax: number;
} {
  let ltcgGains = 0;
  let stcgGains = 0;
  let debtGains = 0;

  for (const gain of gains) {
    if (gain.isLTCG) {
      ltcgGains += gain.gainLoss;
    } else if (gain.isSTCG) {
      stcgGains += gain.gainLoss;
    } else if (gain.isDebt) {
      debtGains += gain.gainLoss;
    }
  }

  // Tax calculation:
  // LTCG: 12.5% on gains above ₹1.25L exemption
  // STCG: 20% flat
  // Debt: User's tax slab rate
  const ltcgTax = Math.max(0, ltcgGains - 125000) * 0.125;
  const stcgTax = Math.max(0, stcgGains) * 0.2;
  const debtTax = Math.max(0, debtGains) * (taxSlabPercentage / 100);

  return {
    ltcgGains,
    stcgGains,
    debtGains,
    estimatedTax: ltcgTax + stcgTax + debtTax,
  };
}
