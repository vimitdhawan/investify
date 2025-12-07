import { DataTable } from "@/components/transactions/data-table";
import { getTransactionsByIsin } from "@/lib/repository/portfolio";
import { Transaction, TransactionView } from "@/lib/types/portfolio";
import { TransactionType } from "@/lib/types/enums";

function createTransactionViews(transactions: Transaction[]): TransactionView[] {
  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = [];
    }
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const views: TransactionView[] = [];

  // Process each date group
  for (const date in groupedByDate) {
    const dailyTxs = groupedByDate[date];
    // Sort transactions within the day to ensure consistent order
    dailyTxs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let k = 0;
    while (k < dailyTxs.length) {
      const currentTx = dailyTxs[k];
      let view: TransactionView = {
        date: currentTx.date,
        description: currentTx.description,
        type: currentTx.type,
        nav: currentTx.nav,
        units: currentTx.units,
        balance: currentTx.balance,
      };

      if (
        currentTx.type === TransactionType.Purchase ||
        currentTx.type === TransactionType.PurchaseSIP ||
        currentTx.type === TransactionType.SwitchIn ||
        currentTx.type === TransactionType.SwitchInMerger
      ) {
        view.actualInvestment = currentTx.amount;
        view.investedAmount = currentTx.amount;

        let nextK = k + 1;
        while (nextK < dailyTxs.length) {
          const nextTx = dailyTxs[nextK];
          if (nextTx.date === currentTx.date && nextTx.type === TransactionType.StampDutyTax) {
            view.stampDuty = nextTx.amount;
            view.investedAmount += nextTx.amount;
            nextK++;
          } else if (nextTx.date === currentTx.date && nextTx.type === TransactionType.SttTax) {
            view.sttTax = nextTx.amount;
            view.investedAmount += nextTx.amount;
            nextK++;
          } else {
            break;
          }
        }
        k = nextK;
      } else if (
        currentTx.type === TransactionType.Redemption ||
        currentTx.type === TransactionType.SwitchOut ||
        currentTx.type === TransactionType.SwitchOutMerger
      ) {
        view.withdrawAmount = currentTx.amount;

        let nextK = k + 1;
        while (nextK < dailyTxs.length) {
          const nextTx = dailyTxs[nextK];
          if (nextTx.date === currentTx.date && nextTx.type === TransactionType.SttTax) {
            view.sttTax = nextTx.amount;
            nextK++;
          } else if (nextTx.date === currentTx.date && nextTx.type === TransactionType.TdsTax) {
            view.ltcgStcgTax = nextTx.amount;
            nextK++;
          } else {
            break;
          }
        }
        k = nextK;
      } else {
        // Handle other transaction types individually
        if (currentTx.type === TransactionType.DividendPayout) {
          view.withdrawAmount = currentTx.amount;
        } else if (currentTx.type === TransactionType.DividendReinvestment) {
          view.investedAmount = currentTx.amount;
        }
        k++;
      }
      views.push(view);
    }
  }

  // Sort final views by date descending
  return views.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function SchemeTransactionsPage(props: {
  params: Promise<{ isin: string }>;
}) {
  const { isin } = await props.params;
  const transactions = await getTransactionsByIsin(isin);
  const transactionViews = createTransactionViews(transactions);

  return <DataTable data={transactionViews} />;
}
