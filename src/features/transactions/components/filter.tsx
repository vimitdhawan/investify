import type { Table } from '@tanstack/react-table';

interface TableFiltersProps {
  _table: Table<any>;
}

export function TableFilters({ _table }: TableFiltersProps) {
  return <div className="flex flex-wrap gap-4 sm:gap-4 grow"></div>;
}
