import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { type TaxSummary } from '@/features/tax-report/type';

import { cn } from '@/lib/utils';

interface TaxSummaryCardsProps {
  taxSummary: TaxSummary;
  taxSlabPercentage: number;
}

export function TaxSummaryCards({ taxSummary, taxSlabPercentage }: TaxSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const LTCG_REBATE = 125000;

  return (
    <div className="flex flex-col gap-4">
      {/* First Row: 3 cards (LTCG, STCG, Slab) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* LTCG Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTCG (Equity)</CardTitle>
            <div className="text-xs text-muted-foreground">
              Exemption: {formatCurrency(LTCG_REBATE)}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                taxSummary.netLtcg < 0 ? 'text-red-500' : 'text-green-500'
              )}
            >
              {formatCurrency(taxSummary.netLtcg)}
            </div>
            {taxSummary.ltcgLoss > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                Loss: {formatCurrency(taxSummary.ltcgLoss)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Taxable: {formatCurrency(taxSummary.ltcgTaxable)} | Tax (12.5%):{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(taxSummary.ltcgTax)}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* STCG Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">STCG (Equity)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                taxSummary.netStcg < 0 ? 'text-red-500' : 'text-green-500'
              )}
            >
              {formatCurrency(taxSummary.netStcg)}
            </div>
            {taxSummary.stcgLoss > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                Loss: {formatCurrency(taxSummary.stcgLoss)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Taxable: {formatCurrency(taxSummary.stcgTaxable)} | Tax (20%):{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(taxSummary.stcgTax)}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Slab Gains Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slab Gains (Debt)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                taxSummary.netDebt < 0 ? 'text-red-500' : 'text-green-500'
              )}
            >
              {formatCurrency(taxSummary.netDebt)}
            </div>
            {taxSummary.debtLoss > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                Loss: {formatCurrency(taxSummary.debtLoss)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Taxable: {formatCurrency(taxSummary.debtTaxable)} | Tax ({taxSlabPercentage}%):{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(taxSummary.debtTax)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: 2 cards (Total Tax, Tax Due/Refund) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Total Tax Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Due</CardTitle>
            <div className="text-xs text-muted-foreground">After loss set-off & rebate</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {formatCurrency(taxSummary.totalCalculatedTax)}
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-xs text-muted-foreground">
                LTCG: {formatCurrency(taxSummary.ltcgTax)}
              </p>
              <p className="text-xs text-muted-foreground">
                STCG: {formatCurrency(taxSummary.stcgTax)}
              </p>
              <p className="text-xs text-muted-foreground">
                Slab: {formatCurrency(taxSummary.debtTax)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tax Due/Refund Card - Dynamic */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {taxSummary.taxDueOrRefund === 0
                ? 'Balanced'
                : taxSummary.isRefund
                  ? 'Tax Refund'
                  : 'Tax Due'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                taxSummary.taxDueOrRefund === 0
                  ? 'text-muted-foreground'
                  : taxSummary.isRefund
                    ? 'text-green-500'
                    : 'text-red-500'
              )}
            >
              {formatCurrency(Math.abs(taxSummary.taxDueOrRefund))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tax Paid:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(taxSummary.totalTaxPaid)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {taxSummary.taxDueOrRefund === 0
                ? 'No tax due or refund'
                : taxSummary.isRefund
                  ? 'Amount you can claim back'
                  : 'Amount you need to pay'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
