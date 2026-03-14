// components/TableBody.tsx
import { type Table, flexRender } from '@tanstack/react-table';

import { TableBody as TableBodyUI, TableCell, TableRow } from '@/components/ui/table';

interface TableBodyProps {
  table: Table<any>;
}

export function TableBody({ table }: TableBodyProps) {
  return (
    <TableBodyUI className="**:data-[slot=table-cell]:first:w-8">
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
            No Transaction Found
          </TableCell>
        </TableRow>
      )}
    </TableBodyUI>
  );
}
