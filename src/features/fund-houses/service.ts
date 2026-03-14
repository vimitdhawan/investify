import type { MutualFundView } from '@/features/fund-houses/type';
import { getSchemes } from '@/features/schemes/service';
import type { Scheme } from '@/features/schemes/type';
import {
  calculateXIRR,
  exludeReverseTransactions,
  getTransactionsBySchemeId,
} from '@/features/transactions/service';

export async function getFundHouses(userId: string) {
  const schemes = await getSchemes(userId);
  const fundsMap: Map<string, { amc: string; folioNumbers: Set<string>; schemes: Scheme[] }> =
    new Map();
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
  for (const [_key, fundGroup] of fundsMap.entries()) {
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
    const gainLossPercentage = investedAmount > 0 ? (absoluteGainLoss / investedAmount) * 100 : 0;
    const stampDuty = fundGroup.schemes.reduce((acc, s) => acc + (s.stampDuty ?? 0), 0);

    const transactionsPerScheme = await Promise.all(
      fundGroup.schemes.map((scheme) => getTransactionsBySchemeId(userId, scheme.id))
    );
    const transactions = transactionsPerScheme.map((t) => exludeReverseTransactions(t)).flat();
    const _date =
      fundGroup.schemes.find((s) => s.latestNavDate != null)?.latestNavDate ?? new Date();

    const xirrGainLoss = calculateXIRR(transactions, marketValue, new Date()) ?? 0;
    mutualFundViews.push({
      name: fundGroup.amc,
      folioNumbers: [...fundGroup.folioNumbers.keys()],
      investedAmount,
      marketValue,
      absoluteGainLoss,
      realizedGainLoss,
      absoluteGainLossPercentage: gainLossPercentage,
      stampDuty: stampDuty,
      xirrGainLoss: xirrGainLoss,
    });
  }
  return mutualFundViews;
}
