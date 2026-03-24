'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TAX_SLABS = [
  { label: '0%', value: '0' },
  { label: '5%', value: '5' },
  { label: '10%', value: '10' },
  { label: '15%', value: '15' },
  { label: '20%', value: '20' },
  { label: '25%', value: '25' },
  { label: '30%', value: '30' },
];

interface TaxSlabSelectProps {
  currentSlab: string;
}

export function TaxSlabSelect({ currentSlab }: TaxSlabSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('slab', value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium whitespace-nowrap">Your Tax Slab:</span>
      <Select value={currentSlab} onValueChange={handleChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Slab" />
        </SelectTrigger>
        <SelectContent>
          {TAX_SLABS.map((slab) => (
            <SelectItem key={slab.value} value={slab.value}>
              {slab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
