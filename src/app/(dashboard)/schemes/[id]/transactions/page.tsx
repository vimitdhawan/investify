import { DataTable } from "@/components/transactions/data-table";
import { getTransactionsByScemeId } from "@/lib/repository/portfolio";

export default async function SchemeTransactionsPage({
    params
}: {
    params: { id: string } | Promise<{ id: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  const transactionViews = await getTransactionsByScemeId(id);
  return <DataTable data={transactionViews} />;
}
