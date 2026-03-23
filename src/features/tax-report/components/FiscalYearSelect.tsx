'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiscalYearSelectProps {
  availableFYs: string[];
  currentFY: string;
}

export function FiscalYearSelect({ availableFYs, currentFY }: FiscalYearSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('fy', value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Fiscal Year:</span>
      <Select value={currentFY} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Fiscal Year" />
        </SelectTrigger>
        <SelectContent>
          {availableFYs.map((fy) => (
            <SelectItem key={fy} value={fy}>
              FY {fy}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
