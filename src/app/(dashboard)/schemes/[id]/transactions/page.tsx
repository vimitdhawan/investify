import Link from 'next/link';
import { redirect } from 'next/navigation';

import { IconArrowLeft } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

import { DataTable } from '@/features/transactions/components/data-table';
import { getTransactionViews } from '@/features/transactions/service';

import { getSessionUserId } from '@/lib/session';

export default async function SchemeTransactionsPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  const transactionViews = await getTransactionViews(userId, id);
  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href="/schemes">
          <Button variant="outline">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Schemes
          </Button>
        </Link>
      </div>
      <DataTable data={transactionViews} />
    </div>
  );
}
