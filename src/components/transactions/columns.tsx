import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TransactionView } from "@/lib/types/portfolio";
import { formatCurrency } from "@/lib/utils";

export const columns: ColumnDef<TransactionView>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div>{row.original.date}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "investedAmount",
    header: "Invested Amount",
    cell: ({ row }) => (
      <div>{formatCurrency(row.original.investedAmount)}</div>
    ),
  },
  {
    accessorKey: "actualInvestment",
    header: "Actual Investment",
    cell: ({ row }) => (
      <div>{formatCurrency(row.original.actualInvestment)}</div>
    ),
  },
  {
    accessorKey: "stampDuty",
    header: "Stamp Duty",
    cell: ({ row }) => <div>{formatCurrency(row.original.stampDuty)}</div>,
  },
  {
    accessorKey: "withdrawAmount",
    header: "Withdraw Amount",
    cell: ({ row }) => (
      <div>{formatCurrency(row.original.withdrawAmount)}</div>
    ),
  },
  {
    accessorKey: "sttTax",
    header: "STT Tax",
    cell: ({ row }) => <div>{formatCurrency(row.original.sttTax)}</div>,
  },
  {
    accessorKey: "ltcgStcgTax",
    header: "LTCG/STCG Tax",
    cell: ({ row }) => <div>{formatCurrency(row.original.ltcgStcgTax)}</div>,
  },
  {
    accessorKey: "nav",
    header: "NAV",
    cell: ({ row }) => <div>{row.original.nav}</div>,
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => <div>{row.original.units}</div>,
  },
];
