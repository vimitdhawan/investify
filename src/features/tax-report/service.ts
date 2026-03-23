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
    const totalSaleUnits = Math.abs(sale.units);
    const totalTaxPaid = sale.capitalGainTax ?? 0;

    for (const purchase of purchases) {
      if (unitsToSell <= 0) break;

      if (purchase.remainingUnits > 0) {
        const unitsToProcess = Math.min(unitsToSell, purchase.remainingUnits);
        const gainLoss = unitsToProcess * (salePricePerUnit - purchase.nav);

        // Proportionally distribute tax paid based on units
        // If sale has 100 units with ₹10,000 tax, and this gain is for 60 units:
        // taxPaid = (60 / 100) * 10,000 = ₹6,000
        const proportionalTaxPaid =
          totalSaleUnits > 0 ? (unitsToProcess / totalSaleUnits) * totalTaxPaid : 0;

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
          taxPaid: proportionalTaxPaid, // Proportionally distributed tax paid
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
 * Calculates tax summary from realized gains including tax already paid
 * Implements correct capital loss set-off rules as per Indian Income Tax
 */
export function calculateTaxSummary(
  gains: RealizedGainDetail[],
  taxSlabPercentage: number
): {
  ltcgGains: number;
  stcgGains: number;
  debtGains: number;
  ltcgLoss: number;
  stcgLoss: number;
  debtLoss: number;
  netLtcg: number;
  netStcg: number;
  netDebt: number;
  ltcgTaxable: number;
  stcgTaxable: number;
  debtTaxable: number;
  ltcgTax: number;
  stcgTax: number;
  debtTax: number;
  totalCalculatedTax: number;
  totalTaxPaid: number;
  taxDueOrRefund: number;
  isRefund: boolean;
} {
  let ltcgGains = 0;
  let ltcgLoss = 0;
  let stcgGains = 0;
  let stcgLoss = 0;
  let debtGains = 0;
  let debtLoss = 0;
  let totalTaxPaid = 0;

  // Step 1: Separate gains and losses by type
  for (const gain of gains) {
    if (gain.isLTCG) {
      if (gain.gainLoss >= 0) {
        ltcgGains += gain.gainLoss;
      } else {
        ltcgLoss += Math.abs(gain.gainLoss);
      }
    } else if (gain.isSTCG) {
      if (gain.gainLoss >= 0) {
        stcgGains += gain.gainLoss;
      } else {
        stcgLoss += Math.abs(gain.gainLoss);
      }
    } else if (gain.isDebt) {
      if (gain.gainLoss >= 0) {
        debtGains += gain.gainLoss;
      } else {
        debtLoss += Math.abs(gain.gainLoss);
      }
    }

    // Sum tax already paid
    totalTaxPaid += gain.taxPaid;
  }

  // Step 2: Apply loss set-off rules
  // Rule: LTCL can offset LTCG first, excess LTCL can offset STCG
  // Rule: STCL can only offset STCG, cannot offset LTCG
  // Rule: Debt loss can only offset Debt gain

  // Calculate net LTCG after LTCL offset
  let netLtcg = ltcgGains - ltcgLoss;
  let excessLtcl = 0;

  if (netLtcg < 0) {
    // We have excess LTCL that can offset STCG
    excessLtcl = Math.abs(netLtcg);
    netLtcg = 0;
  }

  // Calculate net STCG after STCL and excess LTCL offset
  let netStcg = stcgGains - stcgLoss - excessLtcl;
  netStcg = Math.max(0, netStcg); // Can't be negative

  // Calculate net Debt gain after Debt loss offset
  let netDebt = debtGains - debtLoss;
  netDebt = Math.max(0, netDebt); // Can't be negative

  // Step 3: Apply rebate and calculate taxable amounts
  const LTCG_REBATE = 125000;

  // LTCG: Apply ₹1.25L rebate after loss set-off
  const ltcgTaxable = Math.max(0, netLtcg - LTCG_REBATE);

  // STCG: Already offset by losses
  const stcgTaxable = netStcg;

  // Debt: Already offset by losses
  const debtTaxable = netDebt;

  // Step 4: Calculate taxes
  const ltcgTax = ltcgTaxable * 0.125; // 12.5%
  const stcgTax = stcgTaxable * 0.2; // 20%
  const debtTax = debtTaxable * (taxSlabPercentage / 100);

  const totalCalculatedTax = ltcgTax + stcgTax + debtTax;
  const taxDueOrRefund = totalCalculatedTax - totalTaxPaid;

  return {
    ltcgGains,
    stcgGains,
    debtGains,
    ltcgLoss,
    stcgLoss,
    debtLoss,
    netLtcg,
    netStcg,
    netDebt,
    ltcgTaxable,
    stcgTaxable,
    debtTaxable,
    ltcgTax,
    stcgTax,
    debtTax,
    totalCalculatedTax,
    totalTaxPaid,
    taxDueOrRefund,
    isRefund: taxDueOrRefund < 0,
  };
}
