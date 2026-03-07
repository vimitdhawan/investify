import { getSubCollection, getNestedSubCollection } from '@/lib/db';

import { Scheme } from '@/features/schemes/type';
import { Transaction } from '@/features/transactions/type';
import { toJSDate } from '@/lib/utils/date';

export async function getSchemes(userId: string): Promise<Scheme[]> {
  const schemes = await getSubCollection<Scheme>('users', userId, 'schemes');
  return schemes.map((s) => ({
    ...s,
    latestNavDate: toJSDate(s.latestNavDate),
  }));
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
        transactions: transactions.map((t) => ({
          ...t,
          date: toJSDate(t.date),
        })),
      };
    })
  );
  return resp;
}
