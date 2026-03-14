import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { MutualFundView } from '@/features/fund-houses/type';

import { cn } from '@/lib/utils';

// FinancialDetail component (copied from scheme-card.tsx)
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

interface FundHouseCardProps {
  mutualFund: MutualFundView;
}

export function FundHouseCard({ mutualFund }: FundHouseCardProps) {
  const isFundClosed = (mutualFund.marketValue ?? 0) === 0; // Check for closed fund

  const isGain = (mutualFund?.absoluteGainLoss ?? 0) >= 0;
  const gainLossColorClass = isGain ? 'text-green-500' : 'text-red-500';
  const xirrGainLossClass =
    (mutualFund?.xirrGainLoss ?? 0) >= 0 ? 'text-green-500' : 'text-red-500';
  const _Icon = isGain ? IconTrendingUp : IconTrendingDown;

  // Realized Gain/Loss specific color class
  const isRealizedGain = (mutualFund.realizedGainLoss ?? 0) >= 0;
  const realizedGainLossColorClass = isRealizedGain ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <CardTitle className="text-base font-semibold leading-snug">
              {mutualFund.name}
            </CardTitle>
            <CardDescription className="text-xs pt-1">{`Folio: ${mutualFund.folioNumbers}`}</CardDescription>
          </div>
          {isFundClosed && ( // Display Badge if fund is closed
            <Badge variant="destructive" className="ml-2 whitespace-nowrap">
              Closed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm flex-grow">
        {isFundClosed ? (
          // Only show Realized Profit for closed funds
          mutualFund.realizedGainLoss !== undefined && (
            <FinancialDetail
              label="Realized Profit"
              value={mutualFund.realizedGainLoss.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              valueClass={realizedGainLossColorClass}
            />
          )
        ) : (
          // Show all details for active funds
          <>
            <FinancialDetail
              label="Market Value"
              value={
                mutualFund.marketValue?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) ?? 'N/A'
              }
            />
            <FinancialDetail
              label="Invested"
              value={mutualFund.investedAmount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            {mutualFund.stampDuty != null && (
              <FinancialDetail
                label="Stamp Duty"
                value={mutualFund.stampDuty.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              />
            )}
            {mutualFund.xirrGainLoss != null && (
              <FinancialDetail
                label="XIRR Gain Loss"
                value={`${mutualFund.xirrGainLoss?.toFixed(2)}%`}
                valueClass={xirrGainLossClass} // fix class here
              />
            )}
            <FinancialDetail
              label="Abs. Gain/Loss"
              value={`${mutualFund.absoluteGainLoss?.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} (${mutualFund.absoluteGainLossPercentage?.toFixed(2)}%)`}
              valueClass={gainLossColorClass}
            />
            {mutualFund.realizedGainLoss !== undefined && (
              <FinancialDetail
                label="Realized Profit"
                value={mutualFund.realizedGainLoss.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                valueClass={realizedGainLossColorClass}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
