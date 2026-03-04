import { Transaction } from '@/features/transactions/type';
import {
  aggregateTransactions,
  calculateXIRR,
  exludeReverseTransactions,
  getTransactions,
} from '@/features/transactions/service';
import {
  SchemeView,
  Scheme,
  SchemeNavStatus,
  DerivedScheme,
} from '@/features/schemes/type';
import {
  getAmficCodeByIsin,
  getHistoricalNavBySchemeId,
  getLatestNavBySchemeId,
} from '@/lib/clients/mf';
import { SchemeNav } from '@/lib/clients/mf';
import { parseDDMMYYYYString, parseYYYYMMDDString } from '@/lib/utils/date';
import { getSchemes } from '@/features/schemes/repository';
import { logger } from '@/lib/logger';

export async function fetchSchemes(
  userId: string,
  reqDate?: Date
): Promise<SchemeView[]> {
  const schemes = await getSchemes(userId);
  if (!schemes.length) return [];
  const processedSchemes = await Promise.all(
    schemes.map(async (scheme) => {
      const transactions = await getTransactions(userId, scheme.id);
      return toSchemeView(scheme, transactions, reqDate);
    })
  );
  return processedSchemes;
}

export async function fetchSchemeNAV(
  amfiCode: string,
  isin: string,
  date?: Date
): Promise<SchemeNav | null> {
  if (!amfiCode) {
    const amfi = await getAmficCodeByIsin(isin);
    if (!amfi) {
      return null;
    }
    amfiCode = amfi.toString();
  }
  if (date) {
    const navs = await getHistoricalNavBySchemeId(amfiCode);
    const requestedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    for (const nav of navs) {
      const navDate = parseDDMMYYYYString(nav.date);
      if (navDate.getTime() === requestedDate.getTime()) {
        return nav;
      }
      if (navDate < requestedDate) {
        return nav;
      }
    }
  } else {
    logger.info({ amfiCode, date }, 'Fetching  latest  NAV');
    const latestNav = await getLatestNavBySchemeId(amfiCode);
    return latestNav;
  }
  return null;
}

export async function toSchemeView(
  scheme: Scheme,
  transactions: Transaction[],
  reqDate?: Date
): Promise<SchemeView> {
  const processedSchme = await processScheme(scheme, transactions, reqDate);
  const res: SchemeView = {
    id: scheme.id,
    name: scheme.name,
    amc: scheme.amc,
    amfi: scheme.amfi,
    isin: scheme.isin,
    units: processedSchme.units,
    investedAmount: processedSchme.inestedAmount ?? 0,
    marketValue: processedSchme.marketValue,
    absoluteGainLoss: processedSchme.absoluteGainLoss,
    absoluteGainLossPercentage: processedSchme.absoluteGainLossPercentage,
    nav: processedSchme.nav,
    date: processedSchme.date,
    realizedGainLoss: processedSchme.realizedGainLoss,
    xirrGainLoss: processedSchme.xirrGainLoss,
    withdrawAmount: processedSchme.withdrawAmount,
    folioNumber: scheme.folioNumber,
    schemdNavStatus: processedSchme.navStatus,
    stampDuty: processedSchme.stampDuty,
  };
  return res;
}

export async function processScheme(
  scheme: Scheme,
  transactions: Transaction[],
  reqDate?: Date
): Promise<DerivedScheme> {
  const filteredTransactions = exludeReverseTransactions(transactions);
  const filteredTransactionByDate = reqDate
    ? filteredTransactions.filter((t) => parseYYYYMMDDString(t.date) <= reqDate)
    : filteredTransactions;
  const aggregateValues = aggregateTransactions(filteredTransactionByDate);
  if (scheme.isClosed) {
    return {
      marketValue: 0,
      absoluteGainLoss: 0,
      absoluteGainLossPercentage: 0,
      inestedAmount: scheme.investedAmount,
      navStatus: SchemeNavStatus.Stale,
      realizedGainLoss: aggregateValues.withdrawAmount - scheme.investedAmount,
      withdrawAmount: aggregateValues.withdrawAmount,
      xirrGainLoss: 0,
      units: 0,
    };
  }
  const navByDate = await fetchSchemeNAV(scheme.amfi, scheme.isin, reqDate);
  if (!navByDate) {
    return {
      navStatus: SchemeNavStatus.Missing,
    };
  }
  const nav = Number(navByDate.nav);
  const date = navByDate.date;
  const marketValue = aggregateValues.unitsHeld * nav;
  const gainLoss = marketValue - aggregateValues.totalCost; // investedAmount is total cost
  const gainLossPercentage = (gainLoss / aggregateValues.totalCost) * 100;
  const valuationDate = reqDate ?? parseDDMMYYYYString(date);
  const xirrValue = calculateXIRR(
    filteredTransactionByDate,
    marketValue,
    valuationDate
  );
  const derivedScheme: DerivedScheme = {
    units: aggregateValues.unitsHeld,
    marketValue: marketValue,
    absoluteGainLossPercentage: gainLossPercentage,
    nav: nav,
    date: date,
    realizedGainLoss: aggregateValues.realizedGainLoss,
    xirrGainLoss: xirrValue!,
    withdrawAmount: aggregateValues.withdrawAmount,
    stampDuty: aggregateValues.stampDuty,
    sttTax: aggregateValues.sttTax,
    capitalGainLoss: aggregateValues.capitalGainTax,
    inestedAmount: aggregateValues.totalCost,
    navStatus: SchemeNavStatus.Available,
    absoluteGainLoss: gainLoss,
  };
  return derivedScheme;
}
