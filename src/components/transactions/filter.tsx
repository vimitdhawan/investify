import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableFiltersProps {
  table: Table<any>;
}

export function TableFilters({ table }: TableFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 sm:gap-4 grow">
    </div>
  );
}
