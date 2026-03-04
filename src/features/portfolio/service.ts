// features/portfolio/portfolio.repository.ts

import { getPortfolio } from '@/features/portfolio/repository';

import { PortfolioView } from '@/features/portfolio/type';
import { fetchSchemes } from '@/features/schemes/service';
import {
  parseYYYYMMDDString,
  formatDateToYYYYMMDD,
  parseDDMMYYYYString,
} from '@/lib/utils/date';
import {
  calculateXIRR,
  getTransactions,
  exludeReverseTransactions,
} from '@/features/transactions/service';
import { Transaction } from '@/features/transactions/type';
import { da } from 'date-fns/locale';

export async function getPortfolioByDate(
  userId: string,
  date?: Date
): Promise<PortfolioView | null> {
  const portfolio = await getPortfolio(userId);
  if (!portfolio) {
    return null;
  }
  const { investor, statements } = portfolio;

  const schemes = await fetchSchemes(userId, date);
  const portfolioDate =
    date != null
      ? formatDateToYYYYMMDD(date)
      : (schemes.find((s) => s.date != null && s.date != '')?.date ?? '');

  const transactionsPerScheme = await Promise.all(
    schemes.map((scheme) => getTransactions(userId, scheme.id))
  );

  const transactions = transactionsPerScheme
    .map((t) => exludeReverseTransactions(t))
    .flat();

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
    date: portfolioDate,
  };

  portfolioView.xirrGainLoss =
    calculatePortfolioXIRR(
      transactions,
      totalMarketValue,
      parseDDMMYYYYString(portfolioDate)
    ) ?? 0; // TODO: Fix xirr value nul use case
  return portfolioView;
}

function calculatePortfolioXIRR(
  transactions: Transaction[],
  marketValue: number,
  date: Date
): number | null {
  return calculateXIRR(transactions, marketValue, date);
}
