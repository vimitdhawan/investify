import { DataTable } from "@/components/transactions/data-table";
import { getTransactionViewsByIsinAndFolio } from "@/lib/repository/portfolio";

export default async function SchemeTransactionsPage({
    params,
    searchParams
}: {
    params: { isin: string } | Promise<{ isin: string }>,
    searchParams: { folio: string } | Promise<{ folio: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const { isin } = resolvedParams;

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { folio } = resolvedSearchParams;

  if (!folio) {
    return <div className="p-4">Folio number is required to view transactions.</div>;
  }

  const transactionViews = await getTransactionViewsByIsinAndFolio(isin, folio);

  return <DataTable data={transactionViews} />;
}
