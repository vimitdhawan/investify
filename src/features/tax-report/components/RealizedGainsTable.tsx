import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type GroupedGain, type RealizedGainDetail } from '@/features/tax-report/type';

import { cn } from '@/lib/utils';
import { formatDateToYYYYMMDD } from '@/lib/utils/date';

interface RealizedGainsTableProps {
  gains: RealizedGainDetail[];
}

export function RealizedGainsTable({ gains }: RealizedGainsTableProps) {
  // Grouping logic - now includes folioNumber to keep different folios separate
  const groupedGainsMap = new Map<string, GroupedGain>();

  gains.forEach((gain) => {
    const saleDateStr = formatDateToYYYYMMDD(gain.saleDate);
    const taxType = gain.isLTCG ? 'LTCG' : gain.isSTCG ? 'STCG' : 'Debt';
    // Group by Name, FolioNumber, Date and Tax Type
    const key = `${gain.schemeName.trim()}-${gain.folioNumber}-${saleDateStr}-${taxType}`;

    const buyAmount = gain.purchasePrice * gain.units;
    const sellAmount = gain.salePrice * gain.units;

    if (groupedGainsMap.has(key)) {
      const existing = groupedGainsMap.get(key)!;
      existing.buyAmount += buyAmount;
      existing.sellAmount += sellAmount;
      existing.gainLoss += gain.gainLoss;
      existing.taxPaid += gain.taxPaid; // Sum tax paid
    } else {
      groupedGainsMap.set(key, {
        schemeName: gain.schemeName,
        folioNumber: gain.folioNumber,
        saleDate: gain.saleDate,
        buyAmount,
        sellAmount,
        gainLoss: gain.gainLoss,
        taxPaid: gain.taxPaid, // Initialize tax paid
        isLTCG: gain.isLTCG,
        isSTCG: gain.isSTCG,
        isDebt: gain.isDebt,
      });
    }
  });

  const sortedGroupedGains = Array.from(groupedGainsMap.values()).sort(
    (a, b) => b.saleDate.getTime() - a.saleDate.getTime()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTaxBadge = (gain: GroupedGain) => {
    if (gain.isLTCG) return <Badge variant="secondary">LTCG</Badge>;
    if (gain.isSTCG) return <Badge variant="outline">STCG</Badge>;
    if (gain.isDebt) return <Badge variant="default">Slab Gain</Badge>;
    return null;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scheme</TableHead>
            <TableHead>Folio</TableHead>
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
                <TableCell className="font-medium">{gain.schemeName}</TableCell>
                <TableCell className="text-muted-foreground">{gain.folioNumber}</TableCell>
                <TableCell>{formatDateToYYYYMMDD(gain.saleDate)}</TableCell>
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
