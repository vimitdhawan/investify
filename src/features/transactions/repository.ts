// features/portfolio/portfolio.repository.ts

import { getNestedSubCollection } from '@/lib/db';
import { Transaction } from '@/features/transactions/type';

export async function getTransactionsByScheme(
  userId: string,
  schemeId: string
): Promise<Transaction[]> {
  return getNestedSubCollection<Transaction>(
    'users',
    userId,
    'schemes',
    schemeId,
    'transactions'
  );
}
