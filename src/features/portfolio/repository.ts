// features/portfolio/portfolio.repository.ts
import type { Investor, Portfolio, Statement } from '@/features/portfolio/type';

import { getDocument, getSubCollection } from '@/lib/db';

const portfolioCache = new Map<string, Portfolio>();

export async function getPortfolio(userId: string): Promise<Portfolio | undefined> {
  const cached = portfolioCache.get(userId);
  if (cached) return cached;

  const investor = await getDocument<Investor>('users', userId);
  if (!investor) return;

  const statements = await getSubCollection<Statement>('users', userId, 'statements');

  const portfolio: Portfolio = {
    investor,
    statements,
  };

  // 5️⃣ Cache it
  portfolioCache.set(userId, portfolio);

  return portfolio;
}
