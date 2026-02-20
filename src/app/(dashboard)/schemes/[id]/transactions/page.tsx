import { DataTable } from '@/components/transactions/data-table';
import { getTransactionsByScemeId } from '@/lib/repository/portfolio';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation';

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
  const transactionViews = await getTransactionsByScemeId(userId, id);
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
