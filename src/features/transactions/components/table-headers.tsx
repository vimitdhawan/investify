// components/TableHeader.tsx
import { Table, flexRender } from '@tanstack/react-table';
import {
  TableHead,
  TableHeader as TableHeaderUI,
  TableRow,
} from '@/components/ui/table';

interface TableHeaderProps {
  table: Table<any>;
}

export function TableHeader({ table }: TableHeaderProps) {
  return (
    <TableHeaderUI className="bg-muted sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              onClick={
                header.column.getCanSort()
                  ? header.column.getToggleSortingHandler()
                  : undefined
              }
              className={
                header.column.getCanSort() ? 'cursor-pointer select-none' : ''
              }
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {{
                asc: ' ↑',
                desc: ' ↓',
              }[header.column.getIsSorted() as string] ?? null}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeaderUI>
  );
}
