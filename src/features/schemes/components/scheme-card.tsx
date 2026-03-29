import Link from 'next/link';

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

import { WithdrawalCalculatorModal } from '@/features/schemes/components/withdrawal-calculator';
import type { SchemeView } from '@/features/schemes/type';

import { cn } from '@/lib/utils';

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
    <div className="flex flex-row items-baseline justify-between gap-2 w-full min-w-0">
      <span className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm shrink-0">
        {label}
      </span>
      <span
        className={cn('font-medium text-right text-xs sm:text-sm truncate min-w-0', valueClass)}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export function SchemeCard({ scheme, previousDayChangePercentage }: SchemeCardProps) {
  const isClosed = scheme.units === 0;

  const isAbsoluteGain = (scheme.absoluteGainLoss ?? 0) >= 0;
  const absoluteGainLossColorClass = isAbsoluteGain ? 'text-green-500' : 'text-red-500';

  const isRealizedGain = (scheme.realizedGainLoss ?? 0) >= 0;
  const realizedGainLossColorClass = isRealizedGain ? 'text-green-500' : 'text-red-500';

  const primaryValue = isClosed ? scheme.withdrawAmount : scheme.marketValue;
  const primaryLabel = isClosed ? 'Withdrawn' : 'Market Value';

  return (
    <Card className="flex flex-col w-full group relative h-full @container/card transition-all hover:shadow-md border-muted-foreground/10">
      {/* Main Clickable Area */}
      <Link href={`/schemes/${scheme.id}/transactions`} className="flex flex-col flex-grow min-w-0">
        <CardHeader className="flex flex-col gap-2 pb-3 min-w-0">
          <div className="flex justify-between items-start gap-3 min-w-0">
            <CardTitle className="text-sm sm:text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-w-0 flex-1">
              {scheme.name}
            </CardTitle>
            <Badge
              variant={isClosed ? 'destructive' : 'default'}
              className="whitespace-nowrap shrink-0 h-4.5 px-1.5 text-[9px] font-bold uppercase tracking-wider mt-0.5"
            >
              {isClosed ? 'Closed' : 'Active'}
            </Badge>
          </div>
          <CardDescription className="text-[10px] sm:text-xs pt-0.5 truncate text-muted-foreground/80 font-mono">
            {`Folio: ${scheme.folioNumber}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2.5 text-sm flex-grow pt-0 min-w-0">
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
          {!isClosed && scheme.units !== undefined && scheme.units > 0 && (
            <FinancialDetail
              label="Avg. NAV"
              value={(scheme.investedAmount / scheme.units).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
                label="Stamp Duty"
                value={`${scheme.stampDuty?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
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
                <div className="flex items-baseline justify-between gap-2 w-full min-w-0">
                  <span className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm shrink-0">
                    Day&apos;s Change
                  </span>
                  <span
                    className={cn(
                      'font-medium flex items-center gap-1 shrink-0 text-xs sm:text-sm',
                      previousDayChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {previousDayChangePercentage >= 0 ? (
                      <IconTrendingUp className="size-3.5 sm:size-4" />
                    ) : (
                      <IconTrendingDown className="size-3.5 sm:size-4" />
                    )}
                    {`${previousDayChangePercentage.toFixed(2)}%`}
                  </span>
                </div>
              )}
            </>
          )}
          {scheme.realizedGainLoss !== undefined && scheme.realizedGainLoss !== 0 && (
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
      </Link>

      {/* Footer Area with Action - Outside the Link to avoid bubbling issues */}
      <CardFooter className="flex-row items-start justify-between gap-4 text-[10px] sm:text-[11px] text-muted-foreground pt-3 sm:pt-4 bg-muted/5 rounded-b-xl border-t min-w-0">
        <div className="flex flex-col gap-1 min-w-0 flex-1 opacity-80 group-hover:opacity-100 transition-opacity items-start text-left">
          <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60 leading-none mb-1">
            Current Status
          </span>
          <div className="flex flex-col items-start gap-1">
            {scheme.nav && scheme.lastNavDate && (
              <div
                className="flex items-center gap-1.5 justify-start"
                title={`NAV: ${scheme.nav.toFixed(2)} as on ${scheme.lastNavDate}`}
              >
                <span className="text-[9px] text-muted-foreground/60">
                  NAV as on {scheme.lastNavDate}
                </span>
                <span className="font-mono text-foreground font-semibold text-[10px] sm:text-xs">
                  ₹{scheme.nav.toFixed(2)}
                </span>
              </div>
            )}
            {scheme.units !== undefined && scheme.units > 0 && (
              <div
                className="flex items-center gap-1.5 justify-start"
                title={`Units: ${scheme.units.toFixed(4)}`}
              >
                <span className="text-[9px] text-muted-foreground/60">Units</span>
                <span className="font-mono text-foreground font-semibold text-[10px] sm:text-xs">
                  {scheme.units.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {!isClosed && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60 leading-none">
              Actions
            </span>
            <div className="flex gap-2">
              <WithdrawalCalculatorModal schemeId={scheme.id} />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
