// components/DataTable.tsx
'use client';

import * as React from 'react';

import {
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Tabs, TabsContent } from '@/components/ui/tabs';

import type { TransactionView } from '@/features/transactions/type';

import { columns } from './columns';
import { TableFilters } from './filter';
import { TableBody } from './table-body';
import { TableHeader } from './table-headers';
import { TablePagination } from './table-pagination';

export function DataTable({ data: initialData }: { data: TransactionView[] }) {
  const [data] = React.useState(() => initialData);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
      <div className="flex flex-col gap-4 px-4 md:px-6">
        {/* Filters and Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TableFilters _table={table} />
        </div>
      </div>
      {/* Table */}
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <table className="min-w-full rounded-lg border">
          <TableHeader table={table} />
          <TableBody table={table} />
        </table>
      </TabsContent>
      {/* Pagination */}
      <TablePagination table={table} />
    </Tabs>
  );
}
