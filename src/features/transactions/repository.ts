// features/portfolio/portfolio.repository.ts

import { getNestedSubCollection } from '@/lib/db';
import { Transaction } from '@/features/transactions/type';
import { toJSDate } from '@/lib/utils/date';
export async function getTransactionsByScheme(
  userId: string,
  schemeId: string
): Promise<Transaction[]> {
  const transactions = await getNestedSubCollection<Transaction>(
    'users',
    userId,
    'schemes',
    schemeId,
    'transactions'
  );
  return transactions.map((t) => ({
    ...t,
    date: toJSDate(t.date),
  }));
}
