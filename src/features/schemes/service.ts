import { getSchemesWithTransactions } from '@/features/schemes/repository';
import { type Scheme, SchemeNavStatus, type SchemeView } from '@/features/schemes/type';
import {
  aggregateTransactions,
  calculateXIRR,
  exludeReverseTransactions,
  filterTransactionsByDate,
} from '@/features/transactions/service';

import {
  type SchemeNav,
  getAmficCodeByIsin,
  getHistoricalNavBySchemeId,
  getLatestNavBySchemeId,
} from '@/lib/clients/mf';
import { formatDateToYYYYMMDD, parseDDMMYYYYString } from '@/lib/utils/date';

export async function getSchemeViews(userId: string): Promise<SchemeView[]> {
  const schemes = await getSchemes(userId);
  return schemes.map((scheme) => toSchemeView(scheme));
}

export async function fetchSchemeNAVByDate(
  amfi: string,
  isin: string,
  date: Date
): Promise<SchemeNav | undefined> {
  const amfiCode = await resolveAmfiCode(amfi, isin);
  if (!amfiCode) {
    return;
  }
  const navs = await getHistoricalNavBySchemeId(amfiCode);
  const requestedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  for (const nav of navs) {
    const navDate = parseDDMMYYYYString(nav.date);
    if (navDate.getTime() === requestedDate.getTime()) {
      return nav;
    }
    if (navDate < requestedDate) {
      return nav;
    }
  }
}

export async function getSchemes(userId: string): Promise<Scheme[]> {
  const schemes = await getSchemesWithTransactions(userId);
  if (!schemes.length) return [];
  return await Promise.all(
    schemes.map(async (scheme) => {
      scheme.transactions = exludeReverseTransactions(scheme.transactions);
      const schemeWithAggregateTx = processSchemeWithAggregateTransactions(scheme);
      if (schemeWithAggregateTx.navStatus !== SchemeNavStatus.Pending) {
        return schemeWithAggregateTx;
      }
      const amfiCode = await resolveAmfiCode(
        schemeWithAggregateTx.amfi,
        schemeWithAggregateTx.isin
      );
      if (!amfiCode) {
        schemeWithAggregateTx.navStatus = SchemeNavStatus.Missing;
        return schemeWithAggregateTx;
      }
      const nav = await getLatestNavBySchemeId(amfiCode);
      if (!nav) {
        schemeWithAggregateTx.navStatus = SchemeNavStatus.Missing;
        return schemeWithAggregateTx;
      }
      const s = await processScheme(scheme, nav);
      s.xirrGainLoss = calculateXIRR(scheme.transactions, s.marketValue, new Date()) ?? 0;
      return s;
    })
  );
}

export async function getActiveSchemes(userId: string): Promise<Scheme[]> {
  const schemes = await getSchemes(userId);
  return schemes.filter((s) => !s.isClosed);
}

async function resolveAmfiCode(
  amfiCode: string | undefined,
  isin: string
): Promise<string | undefined> {
  if (amfiCode) {
    return amfiCode;
  }
  const amfi = await getAmficCodeByIsin(isin);
  if (!amfi) {
    return;
  }
  return amfi.toString();
}

export async function getSchemesByDate(userId: string, reqDate: Date): Promise<Scheme[]> {
  const schemes = await getSchemesWithTransactions(userId);
  if (!schemes.length) return [];
  return await Promise.all(
    schemes.map(async (scheme) => {
      const transactions = exludeReverseTransactions(scheme.transactions);
      scheme.transactions = filterTransactionsByDate(transactions, reqDate);
      const schemeWithAggregateTx = processSchemeWithAggregateTransactions(scheme);
      if (schemeWithAggregateTx.navStatus !== SchemeNavStatus.Pending) {
        return schemeWithAggregateTx;
      }
      const nav = await fetchSchemeNAVByDate(scheme.amfi, scheme.isin, reqDate);
      if (!nav) {
        schemeWithAggregateTx.navStatus = SchemeNavStatus.Missing;
        return schemeWithAggregateTx;
      }
      const s = processScheme(schemeWithAggregateTx, nav);
      return s;
    })
  );
}

export function toSchemeView(scheme: Scheme): SchemeView {
  const res: SchemeView = {
    id: scheme.id,
    name: scheme.name,
    amc: scheme.amc,
    amfi: scheme.amfi,
    isin: scheme.isin,
    units: scheme.units,
    investedAmount: scheme.investedAmount,
    marketValue: scheme.marketValue,
    absoluteGainLoss: scheme.absoluteGainLoss,
    absoluteGainLossPercentage: scheme.absoluteGainLossPercentage,
    nav: scheme.nav,
    lastNavDate:
      scheme.navStatus === SchemeNavStatus.Available
        ? formatDateToYYYYMMDD(scheme.latestNavDate)
        : '',
    realizedGainLoss: scheme.realizedGainLoss,
    xirrGainLoss: scheme.xirrGainLoss,
    withdrawAmount: scheme.withdrawAmount,
    folioNumber: scheme.folioNumber,
    schemdNavStatus: scheme.navStatus,
    stampDuty: scheme.stampDuty,
  };
  return res;
}
function processSchemeWithAggregateTransactions(scheme: Scheme): Scheme {
  const aggregated = aggregateTransactions(scheme.transactions);
  // Default values from aggregated transactions
  scheme.withdrawAmount = aggregated.withdrawAmount;
  scheme.stampDuty = aggregated.stampDuty;
  scheme.sttTax = aggregated.sttTax;
  scheme.capitalGainTax = aggregated.capitalGainTax;
  if (scheme.isClosed) {
    scheme.navStatus = SchemeNavStatus.Stale;
    scheme.realizedGainLoss = scheme.withdrawAmount - scheme.investedAmount;
    return scheme;
  }
  scheme.investedAmount = aggregated.investedAmount;
  scheme.units = aggregated.units;
  scheme.realizedGainLoss = aggregated.realizedGainLoss;
  return scheme;
}

export async function processScheme(scheme: Scheme, schemeNav: SchemeNav): Promise<Scheme> {
  const nav = Number(schemeNav.nav);
  const marketValue = scheme.units * nav;
  const gainLoss = marketValue - scheme.investedAmount;
  const gainLossPercentage =
    scheme.investedAmount > 0 ? (gainLoss / scheme.investedAmount) * 100 : 0;
  scheme.nav = nav;
  scheme.marketValue = marketValue;
  scheme.absoluteGainLoss = gainLoss;
  scheme.absoluteGainLossPercentage = gainLossPercentage;
  scheme.latestNavDate = parseDDMMYYYYString(schemeNav.date);
  scheme.navStatus = SchemeNavStatus.Available;
  return scheme;
}
