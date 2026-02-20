import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SchemeView } from '@/features/schemes/type';
import Link from 'next/link';

interface SchemeCardProps {
  scheme: SchemeView;
  previousDayChangePercentage: number;
}

function FinancialDetail({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', valueClass)}>{value}</span>
    </div>
  );
}

export function SchemeCard({
  scheme,
  previousDayChangePercentage,
}: SchemeCardProps) {
  const isClosed = scheme.units === 0;

  const isAbsoluteGain = (scheme.absoluteGainLoss ?? 0) >= 0;
  const absoluteGainLossColorClass = isAbsoluteGain
    ? 'text-green-500'
    : 'text-red-500';

  const isRealizedGain = (scheme.realizedGainLoss ?? 0) >= 0;
  const realizedGainLossColorClass = isRealizedGain
    ? 'text-green-500'
    : 'text-red-500';

  const primaryValue = isClosed ? scheme.withdrawAmount : scheme.marketValue;
  const primaryLabel = isClosed ? 'Withdrawn' : 'Market Value';

  return (
    <Link href={`/schemes/${scheme.id}/transactions`} className="flex">
      <Card className="flex flex-col w-full @container/card">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <CardTitle className="text-base font-semibold leading-snug">
                {scheme.name}
              </CardTitle>
              <CardDescription className="text-xs pt-1">{`Folio: ${scheme.folioNumber}`}</CardDescription>
            </div>
            <Badge
              variant={isClosed ? 'destructive' : 'default'}
              className="ml-2 whitespace-nowrap"
            >
              {isClosed ? 'Closed' : 'Active'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 text-sm flex-grow">
          <FinancialDetail
            label={primaryLabel}
            value={
              primaryValue?.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? 'N/A'
            }
          />
          <FinancialDetail
            label="Invested"
            value={scheme.investedAmount.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          />
          {!isClosed &&
            scheme.units !== undefined &&
            scheme.units > 0 && ( // Only for active schemes with units
              <FinancialDetail
                label="Avg. NAV"
                value={(scheme.investedAmount / scheme.units).toLocaleString(
                  'en-IN',
                  {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              />
            )}
          {!isClosed && (
            <>
              <FinancialDetail
                label="Abs. Gain/Loss"
                value={`${scheme.absoluteGainLoss?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} (${scheme.absoluteGainLossPercentage?.toFixed(2)}%)`}
                valueClass={absoluteGainLossColorClass}
              />
              <FinancialDetail
                label="XIRR"
                value={`${scheme.xirrGainLoss?.toFixed(2)}%`}
                valueClass={
                  scheme.xirrGainLoss && scheme.xirrGainLoss >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }
              />
              {previousDayChangePercentage !== undefined && (
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Day's Change:</span>
                  <span
                    className={cn(
                      'font-medium flex items-center gap-1',
                      previousDayChangePercentage >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  >
                    {previousDayChangePercentage >= 0 ? (
                      <IconTrendingUp className="size-4" />
                    ) : (
                      <IconTrendingDown className="size-4" />
                    )}
                    {`${previousDayChangePercentage.toFixed(2)}%`}
                  </span>
                </div>
              )}
            </>
          )}
          {scheme.realizedGainLoss !== undefined && (
            <FinancialDetail
              label="Realized Profit"
              value={scheme.realizedGainLoss.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              valueClass={realizedGainLossColorClass}
            />
          )}
        </CardContent>

        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground pt-4">
          <div className="h-px w-full bg-border mb-2" />
          {scheme.nav && scheme.date && (
            <div className="flex justify-between w-full">
              <span>
                NAV: {scheme.nav.toFixed(2)} as on {scheme.date}
              </span>
            </div>
          )}
          {scheme.units !== undefined && scheme.units > 0 && (
            <div className="flex justify-between w-full">
              <span>Units: {scheme.units.toFixed(4)}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
