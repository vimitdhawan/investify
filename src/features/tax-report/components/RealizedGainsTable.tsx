import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type RealizedGainLoss } from '@/features/tax-report/type';

import { cn } from '@/lib/utils';
import { formatDateToYYYYMMDD } from '@/lib/utils/date';

interface RealizedGainsTableProps {
  gains: RealizedGainLoss[];
}

export function RealizedGainsTable({ gains }: RealizedGainsTableProps) {
  // Sort grouped gains by sale date (most recent first)
  const sortedGroupedGains = [...gains].sort(
    (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTaxBadge = (gain: RealizedGainLoss) => {
    if (gain.isLTCG) return <Badge variant="secondary">LTCG</Badge>;
    if (gain.isSTCG) return <Badge variant="outline">STCG</Badge>;
    if (gain.isDebt) return <Badge variant="default">Slab Gain</Badge>;
    return null;
  };

  const truncateName = (name: string, maxLength: number = 40) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div className="rounded-md border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px] max-w-[300px]">Scheme</TableHead>
            <TableHead className="min-w-[100px]">Folio</TableHead>
            <TableHead>Sale Date</TableHead>
            <TableHead className="text-right">Buy Amount</TableHead>
            <TableHead className="text-right">Sell Amount</TableHead>
            <TableHead className="text-right">Gain / Loss</TableHead>
            <TableHead className="text-right">Tax Paid</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedGroupedGains.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No realized gains found for this period.
              </TableCell>
            </TableRow>
          ) : (
            sortedGroupedGains.map((gain, index) => (
              <TableRow key={`${gain.schemeName}-${gain.folioNumber}-${index}`}>
                <TableCell className="font-medium">{truncateName(gain.schemeName)}</TableCell>
                <TableCell className="text-muted-foreground">{gain.folioNumber}</TableCell>
                <TableCell>{formatDateToYYYYMMDD(new Date(gain.saleDate))}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(gain.buyAmount)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(gain.sellAmount)}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold',
                    gain.gainLoss < 0 ? 'text-red-500' : 'text-green-500'
                  )}
                >
                  {formatCurrency(gain.gainLoss)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(gain.taxPaid)}
                </TableCell>
                <TableCell>{getTaxBadge(gain)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
