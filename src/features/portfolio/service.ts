// features/portfolio/portfolio.repository.ts

import { getPortfolio } from '@/features/portfolio/repository';

import { PortfolioSummary } from '@/features/portfolio/type';
import { getSchemes, getSchemesByDate } from '@/features/schemes/service';
import {
  calculateXIRR,
  getTransactionsBySchemeId,
  exludeReverseTransactions,
  filterTransactionsByDate,
} from '@/features/transactions/service';
import { Transaction } from '@/features/transactions/type';
import { formatDateToYYYYMMDD } from '@/lib/utils/date';
import { logger } from '@/lib/logger';

export async function getLatestPortfolio(
  userId: string
): Promise<PortfolioSummary | undefined> {
  const schemes = await getSchemes(userId);
  if (!schemes) {
    return;
  }
  const date =
    schemes.find((s) => s.latestNavDate <= new Date())?.latestNavDate ??
    new Date();

  const totalInvested = schemes.reduce(
    (acc, s) => acc + (s.units! > 0 ? (s.investedAmount ?? 0) : 0),
    0
  );
  const totalMarketValue = schemes.reduce(
    (acc, s) => acc + (s.units! > 0 ? (s.marketValue ?? 0) : 0),
    0
  );
  const totalAbsoluteGain = schemes.reduce(
    (acc, s) => acc + (s.units! > 0 ? (s.absoluteGainLoss ?? 0) : 0),
    0
  );
  const totalRealizedGain = schemes.reduce(
    (acc, s) => acc + (s.realizedGainLoss ?? 0),
    0
  );
  const totalGainLossPercentage =
    totalInvested > 0 ? (totalAbsoluteGain / totalInvested) * 100 : 0;

  const transactions = await Promise.all(
    schemes.map((scheme) => scheme.transactions).flat()
  );

  const xirrGainLoss = calculateXIRR(transactions, totalMarketValue, date) ?? 0;
  const portfolioSummary: PortfolioSummary = {
    investedValue: totalInvested,
    marketValue: totalMarketValue,
    absoluteGainLoss: totalAbsoluteGain,
    absoluteGainLossPercentage: totalGainLossPercentage,
    realizedGainLoss: totalRealizedGain,
    date: formatDateToYYYYMMDD(date),
    xirrGainLoss: xirrGainLoss,
  };
  return portfolioSummary;
}

export async function getPortfolioSummaryByDate(
  userId: string,
  date: Date
): Promise<PortfolioSummary> {
  const schemes = await getSchemesByDate(userId, date);
  const totalInvested = schemes.reduce(
    (acc, s) => acc + (s.units! > 0 ? (s.investedAmount ?? 0) : 0),
    0
  );
  const totalMarketValue = schemes.reduce(
    (acc, s) => acc + (s.units! > 0 ? (s.marketValue ?? 0) : 0),
    0
  );
  const totalAbsoluteGain = schemes.reduce(
    (acc, s) => acc + (s.units! > 0 ? (s.absoluteGainLoss ?? 0) : 0),
    0
  );
  const totalRealizedGain = schemes.reduce(
    (acc, s) => acc + (s.realizedGainLoss ?? 0),
    0
  );
  const totalGainLossPercentage =
    totalInvested > 0 ? (totalAbsoluteGain / totalInvested) * 100 : 0;

  const portfolioSummary: PortfolioSummary = {
    investedValue: totalInvested,
    marketValue: totalMarketValue,
    absoluteGainLoss: totalAbsoluteGain,
    absoluteGainLossPercentage: totalGainLossPercentage,
    realizedGainLoss: totalRealizedGain,
    date: formatDateToYYYYMMDD(date),
  };
  return portfolioSummary;
}
