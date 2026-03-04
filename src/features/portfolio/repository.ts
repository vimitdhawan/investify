// features/portfolio/portfolio.repository.ts

import { getDocument, getSubCollection } from '@/lib/db';

import { Portfolio, Investor, Statement } from '@/features/portfolio/type';

const portfolioCache = new Map<string, Portfolio>();

export async function getPortfolio(userId: string): Promise<Portfolio | null> {
  const cached = portfolioCache.get(userId);
  if (cached) return cached;

  const investor = await getDocument<Investor>('users', userId);
  if (!investor) return null;

  const statements = await getSubCollection<Statement>(
    'users',
    userId,
    'statements'
  );

  const portfolio: Portfolio = {
    investor,
    statements,
    schemes: [],
  };

  // 5️⃣ Cache it
  portfolioCache.set(userId, portfolio);

  return portfolio;
}
