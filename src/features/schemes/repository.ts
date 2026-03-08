import { getSubCollection, getNestedSubCollection } from '@/lib/db';

import { Scheme } from '@/features/schemes/type';
import { Transaction } from '@/features/transactions/type';

export async function getSchemes(userId: string): Promise<Scheme[]> {
  return getSubCollection<Scheme>('users', userId, 'schemes');
}

export async function getSchemesWithTransactions(
  userId: string
): Promise<Scheme[]> {
  const schemes = await getSchemes(userId);

  const resp = await Promise.all(
    schemes.map(async (s: Scheme) => {
      const transactions = await getNestedSubCollection<Transaction>(
        'users',
        userId,
        'schemes',
        s.id,
        'transactions'
      );
      return {
        ...s,
        transactions,
      };
    })
  );
  return resp;
}
