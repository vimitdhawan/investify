import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { type RealizedGainDetail } from '@/features/tax-report/type';

import { cn } from '@/lib/utils';

interface TaxSummaryCardsProps {
  gains: RealizedGainDetail[];
  taxSlabPercentage: number;
}

export function TaxSummaryCards({ gains, taxSlabPercentage }: TaxSummaryCardsProps) {
  const ltcgTotal = gains.filter((g) => g.isLTCG).reduce((sum, g) => sum + g.gainLoss, 0);

  const stcgTotal = gains.filter((g) => g.isSTCG).reduce((sum, g) => sum + g.gainLoss, 0);

  const slabTotal = gains.filter((g) => g.isDebt).reduce((sum, g) => sum + g.gainLoss, 0);

  // LTCG Tax: 12.5% on gains above 1.25L
  const LTCG_REBATE = 125000;
  const ltcgTaxable = Math.max(0, ltcgTotal - LTCG_REBATE);
  const ltcgTax = ltcgTaxable * 0.125;

  // STCG Tax: 20%
  const stcgTax = Math.max(0, stcgTotal) * 0.2;

  // Slab Tax: user selected percentage
  const slabTax = Math.max(0, slabTotal) * (taxSlabPercentage / 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">LTCG (Equity)</CardTitle>
          <div className="text-xs text-muted-foreground">
            Exemption: {formatCurrency(LTCG_REBATE)}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn('text-2xl font-bold', ltcgTotal < 0 ? 'text-red-500' : 'text-green-500')}
          >
            {formatCurrency(ltcgTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Est. Tax (12.5%):{' '}
            <span className="font-semibold text-foreground">{formatCurrency(ltcgTax)}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">STCG (Equity)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn('text-2xl font-bold', stcgTotal < 0 ? 'text-red-500' : 'text-green-500')}
          >
            {formatCurrency(stcgTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Est. Tax (20%):{' '}
            <span className="font-semibold text-foreground">{formatCurrency(stcgTax)}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Slab Gains</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn('text-2xl font-bold', slabTotal < 0 ? 'text-red-500' : 'text-green-500')}
          >
            {formatCurrency(slabTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Est. Tax ({taxSlabPercentage}%):{' '}
            <span className="font-semibold text-foreground">{formatCurrency(slabTax)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
