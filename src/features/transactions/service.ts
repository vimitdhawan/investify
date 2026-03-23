import xirr from 'xirr';

import { SchemeType } from '@/features/schemes/type';
import { getTransactionsByScheme } from '@/features/transactions/repository';
import {
  type AggregateTransaction,
  type RealizedGainDetail,
  type Transaction,
  TransactionType,
  type TransactionView,
  investmentTypes,
  withdrawTypes,
} from '@/features/transactions/type';

import { logger } from '@/lib/logger';
import { formatDateToYYYYMMDD, getFiscalYear } from '@/lib/utils/date';

export async function getTransactionViews(
  userId: string,
  schemeId: string
): Promise<TransactionView[]> {
  const transactions = await getTransactionsBySchemeId(userId, schemeId);
  const transactionViews: TransactionView[] = [];
  for (const t of transactions) {
    const transactionView: TransactionView = {
      id: t.id,
      date: formatDateToYYYYMMDD(t.date),
      schemeId: t.schemeId,
      description: t.description,
      type: t.type,
      nav: t.nav,
      units: t.units,
      stampDuty: t.stampDuty,
      sttTax: t.sttTax,
      capitalGainTax: t.capitalGainTax,
    };
    if (investmentTypes.includes(t.type)) {
      transactionView.actualInvestment = t.amount;
      transactionView.investedAmount = t.amount + (t.stampDuty ?? 0);
    } else {
      transactionView.withdrawAmount = t.amount;
    }
    transactionViews.push(transactionView);
  }

  return transactionViews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getTransactionsBySchemeId(
  userId: string,
  schemeId: string
): Promise<Transaction[]> {
  return getTransactionsByScheme(userId, schemeId);
}

export function filterTransactionsByDate(transactions: Transaction[], date: Date): Transaction[] {
  return transactions.filter((t) => t.date <= date);
}

export function exludeReverseTransactions(transactions: Transaction[]): Transaction[] {
  const reversals = transactions.filter((tx) => tx.type === TransactionType.REVERSAL);
  const otherTxs = transactions.filter((tx) => tx.type !== TransactionType.REVERSAL);

  if (reversals.length === 0) {
    return transactions; // No reversals, no change needed
  }

  const investmentIdsToCancel = new Set<string>();
  const searchableTxs = [...otherTxs]; // A mutable copy for searching

  for (const reversal of reversals) {
    const matchIndex = searchableTxs.findIndex(
      (tx) =>
        investmentTypes.includes(tx.type) &&
        tx.date === reversal.date &&
        tx.amount === reversal.amount
    );

    if (matchIndex !== -1) {
      // Found the original transaction to cancel
      const matchedTx = searchableTxs[matchIndex];
      investmentIdsToCancel.add(matchedTx.id);

      // Remove it from our searchable list so it can't be matched again
      searchableTxs.splice(matchIndex, 1);
    }
  }

  // Filter the original non-reversal list
  return otherTxs.filter((tx) => !investmentIdsToCancel.has(tx.id));
}

function buildCashFlows(
  transactions: Transaction[],
  marketValue: number,
  valuationDate: Date
): { amount: number; when: Date }[] {
  // transactions.sort((a, b) => a.date.getDate() - b.date.getDate());
  const flows = transactions
    .map((tx) => {
      if (investmentTypes.includes(tx.type)) {
        return {
          amount: -Math.abs(tx.amount),
          when: tx.date,
        };
      }

      if (withdrawTypes.includes(tx.type)) {
        return {
          amount: Math.abs(tx.amount),
          when: tx.date,
        };
      }

      return null;
    })
    .filter((cf): cf is { amount: number; when: Date } => cf !== null);

  if (marketValue > 0) {
    flows.push({
      amount: marketValue,
      when: valuationDate,
    });
  }

  return flows;
}

function isValidForXirr(cashFlows: { amount: number; when: Date }[]): boolean {
  if (cashFlows.length < 2) return false;

  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  const hasNegative = cashFlows.some((cf) => cf.amount < 0);

  return hasPositive && hasNegative;
}

export function calculateXIRR(
  transactions: Transaction[],
  marketValue: number,
  valuationDate: Date
): number | null {
  const cashFlows = buildCashFlows(transactions, marketValue, valuationDate);

  if (!isValidForXirr(cashFlows)) {
    logger.debug({ cashFlowCount: cashFlows.length }, 'XIRR skipped: insufficient valid cashflows');
    return null;
  }

  try {
    const result = xirr(cashFlows);
    return result * 100;
  } catch (error: any) {
    logger.warn(
      {
        error: error?.message,
      },
      'XIRR calculation failed'
    );

    return null;
  }
}

export function aggregateTransactions(transactions: Transaction[]): AggregateTransaction {
  let unitsHeld = 0;
  let currentInvestedAmount = 0;
  let realizedGainLoss = 0;
  let stampDuty = 0;
  let sttTax = 0;
  let capitalGainTax = 0;
  const withdrawAmount: number = transactions // Declared withdrawAmount
    .filter((tx) => withdrawTypes.includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0); // Assuming tx.amount is correct for withdrawal
  const purchases = transactions
    .filter((t) => investmentTypes.includes(t.type) && t.units > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((p) => {
      return {
        ...p,
        remainingUnits: p.units,
      };
    });
  const totalInvestedAmount = purchases.reduce((sum, tx) => sum + tx.amount, 0) + stampDuty;
  unitsHeld = purchases.reduce((sum, tx) => sum + tx.units, 0);
  stampDuty = purchases.reduce((sum, tx) => sum + (tx.stampDuty ?? 0), 0);

  currentInvestedAmount = purchases.reduce((sum, tx) => sum + tx.amount, 0) + stampDuty;

  const sales = transactions
    .filter((t) => withdrawTypes.includes(t.type))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sttTax = sales.reduce((sum, tx) => sum + (tx.sttTax ?? 0), 0);
  capitalGainTax = sales.reduce((sum, tx) => sum + (tx.capitalGainTax ?? 0), 0);

  for (const sale of sales) {
    let unitsToSell = Math.abs(sale.units);
    const salePricePerUnit = sale.nav;
    for (const purchase of purchases) {
      if (unitsToSell === 0) break;
      if (purchase.remainingUnits! > 0) {
        const unitsToProcess = Math.min(unitsToSell, purchase.remainingUnits!);
        unitsHeld -= unitsToProcess;
        currentInvestedAmount -= unitsToProcess * purchase.nav;
        realizedGainLoss += unitsToProcess * (salePricePerUnit - purchase.nav);
        purchase.remainingUnits! -= unitsToProcess;
        unitsToSell -= unitsToProcess;
      } else {
        purchases.shift();
      }
    }
  }
  return {
    units: unitsHeld,
    currentInvestedAmount: currentInvestedAmount,
    totalInvestedAmount: totalInvestedAmount,
    realizedGainLoss,
    withdrawAmount,
    capitalGainTax,
    stampDuty,
    sttTax,
  };
}

/**
 * Calculates detailed realized gains using FIFO logic.
 */
export function calculateRealizedGainsDetailed(
  transactions: Transaction[],
  schemeId: string,
  schemeName: string,
  schemeType: SchemeType
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
