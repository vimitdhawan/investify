import { fetchSchemes } from '@/features/schemes/service';
import { SchemeView } from '@/features/schemes/type';
import { MutualFundView } from '@/features/fund-houses/type';
import {
  calculateXIRR,
  getTransactions,
  exludeReverseTransactions,
} from '@/features/transactions/service';

import { parseYYYYMMDDString, parseDDMMYYYYString } from '@/lib/utils/date';

export async function getFundHouses(userId: string) {
  const schemes = await fetchSchemes(userId);
  const fundsMap: Map<
    string,
    { amc: string; folioNumbers: Set<string>; schemes: SchemeView[] }
  > = new Map();
  schemes.forEach((s) => {
    if (!fundsMap.has(s.amc)) {
      fundsMap.set(s.amc, {
        amc: s.amc,
        folioNumbers: new Set<string>(),
        schemes: [],
      });
    }
    fundsMap.get(s.amc)!.schemes.push(s);
    fundsMap.get(s.amc)!.folioNumbers.add(s.folioNumber);
  });

  const mutualFundViews: MutualFundView[] = [];
  for (const [key, fundGroup] of fundsMap.entries()) {
    const investedAmount = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.units! > 0 ? (s.investedAmount ?? 0) : 0),
      0
    );
    const marketValue = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.units! > 0 ? (s.marketValue ?? 0) : 0),
      0
    );
    const absoluteGainLoss = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.units! > 0 ? (s.absoluteGainLoss ?? 0) : 0),
      0
    );
    const realizedGainLoss = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.realizedGainLoss ?? 0),
      0
    );
    const gainLossPercentage =
      investedAmount > 0 ? (absoluteGainLoss / investedAmount) * 100 : 0;
    const stampDuty = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.stampDuty ?? 0),
      0
    );

    const transactionsPerScheme = await Promise.all(
      fundGroup.schemes.map((scheme) => getTransactions(userId, scheme.id))
    );
    const transactions = transactionsPerScheme
      .map((t) => exludeReverseTransactions(t))
      .flat();
    const date = fundGroup.schemes.find((s) => s.date != null)?.date ?? '';

    const xirrGainLoss =
      date === ''
        ? 0
        : calculateXIRR(transactions, marketValue, parseDDMMYYYYString(date));

    mutualFundViews.push({
      name: fundGroup.amc,
      folioNumbers: [...fundGroup.folioNumbers.keys()],
      investedAmount,
      marketValue,
      absoluteGainLoss,
      realizedGainLoss,
      absoluteGainLossPercentage: gainLossPercentage,
      stampDuty: stampDuty,
      xirrGainLoss: xirrGainLoss!,
      schemes: fundGroup.schemes,
    });
  }
  return mutualFundViews;
}
