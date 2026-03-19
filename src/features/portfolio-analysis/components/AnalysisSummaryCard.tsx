'use client';

/**
 * AnalysisSummaryCard Component
 * Displays key portfolio analysis summary metrics
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { formatCurrency } from '@/lib/utils';

import type { AnalysisSummary } from '../type';

interface AnalysisSummaryCardProps {
  summary: AnalysisSummary;
}

export function AnalysisSummaryCard({ summary }: AnalysisSummaryCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Analysis Summary</CardTitle>
        <CardDescription>Key metrics from your portfolio holdings analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Schemes</div>
            <div className="text-2xl font-bold">{summary.totalSchemes}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Unique Stocks</div>
            <div className="text-2xl font-bold">{summary.totalUniqueStocks}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Unique Sectors</div>
            <div className="text-2xl font-bold">{summary.totalUniqueSectors}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalMarketValue)}</div>
          </div>
        </div>

        {summary.averageOverlap > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Average Overlap</div>
            <div className="text-xl font-semibold">
              {summary.averageOverlap.toFixed(1)} common stocks
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average number of stocks shared between scheme pairs
            </div>
          </div>
        )}

        {summary.schemesWithoutHoldings.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              ⚠️ {summary.schemesWithoutHoldings.length} scheme(s) without holdings data
            </div>
            <div className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
              {summary.schemesWithoutHoldings.slice(0, 3).join(', ')}
              {summary.schemesWithoutHoldings.length > 3 &&
                ` and ${summary.schemesWithoutHoldings.length - 3} more`}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground text-right">
          Last updated: {formatDate(summary.lastUpdated)}
        </div>
      </CardContent>
    </Card>
  );
}
