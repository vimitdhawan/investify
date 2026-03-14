// features/portfolio/portfolio.repository.ts
import type { Transaction } from '@/features/transactions/type';

import { getNestedSubCollection } from '@/lib/db';

export async function getTransactionsByScheme(
  userId: string,
  schemeId: string
): Promise<Transaction[]> {
  return getNestedSubCollection<Transaction>('users', userId, 'schemes', schemeId, 'transactions');
}
