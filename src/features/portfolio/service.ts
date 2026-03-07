// features/portfolio/portfolio.repository.ts

import { getPortfolio } from '@/features/portfolio/repository';

import { PortfolioView } from '@/features/portfolio/type';
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

// export async function getLatestPortfolio(
//   userId: string
// ): Promise<PortfolioView | undefined> {
//   const portfolio = await getPortfolio(userId);
//   if (!portfolio) {
//     return;
//   }
//   const { investor, statements } = portfolio;
//   const schemes = await getSchemes(userId);
//   const date = new Date();
// }

export async function getPortfolioByDate(
  userId: string,
  date?: Date
): Promise<PortfolioView | null> {
  const portfolio = await getPortfolio(userId);
  if (!portfolio) {
    return null;
  }
  const { investor, statements } = portfolio;

  const schemes =
    date == null
      ? await getSchemes(userId)
      : await getSchemesByDate(userId, date);
  const portfolioDate =
    date != null
      ? date
      : (schemes.find((s) => s.latestNavDate != null)?.latestNavDate ??
        new Date());

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

  const portfolioView: PortfolioView = {
    investor: {
      address: investor.address,
      email: investor.email,
      mobile: investor.mobile,
      name: investor.name,
      pan: investor.pan,
    },
    statementPeriods: statements.map((s) => s.period),
    investedValue: totalInvested,
    marketValue: totalMarketValue,
    absoluteGainLoss: totalAbsoluteGain,
    absoluteGainLossPercentage: totalGainLossPercentage,
    realizedGainLoss: totalRealizedGain,
    mutualFunds: [], // Do we need mutual funds here ?
    date: formatDateToYYYYMMDD(portfolioDate),
  };

  const transactions = await Promise.all(
    schemes.map((scheme) => scheme.transactions).flat()
  );

  portfolioView.xirrGainLoss = portfolioDate
    ? (calculatePortfolioXIRR(transactions, totalMarketValue, portfolioDate) ??
      0)
    : 0; // TODO: Fix xirr value nul use case
  return portfolioView;
}

function calculatePortfolioXIRR(
  transactions: Transaction[],
  marketValue: number,
  date: Date
): number | null {
  const filterTransactions = filterTransactionsByDate(transactions, date);
  return calculateXIRR(filterTransactions, marketValue, date);
}
