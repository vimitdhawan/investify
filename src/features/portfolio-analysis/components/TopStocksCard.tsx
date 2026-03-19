'use client';

/**
 * TopStocksCard Component
 * Displays top 5 stocks with chart and table
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { AggregatedStock } from '../type';
import { BarChart, type BarChartDataPoint } from './BarChart';

interface TopStocksCardProps {
  stocks: AggregatedStock[];
}

export function TopStocksCard({ stocks }: TopStocksCardProps) {
  if (!stocks || stocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Holdings</CardTitle>
          <CardDescription>No holdings data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData: BarChartDataPoint[] = stocks.map((stock) => ({
    label: stock.name.length > 25 ? stock.name.substring(0, 25) + '...' : stock.name,
    value: stock.weightedPercentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Holdings</CardTitle>
        <CardDescription>
          Stocks with highest weighted percentage across your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <div className="overflow-x-auto">
          <BarChart
            data={chartData}
            width={800}
            height={300}
            valueFormatter={(v) => `${v.toFixed(2)}%`}
          />
        </div>

        {/* Detailed Table */}
        <div>
          <h4 className="text-sm font-medium mb-3">Detailed Breakdown</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Stock Name</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Weight %</TableHead>
                <TableHead>Appears In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock, index) => (
                <TableRow key={stock.name}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{stock.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{stock.sector}</TableCell>
                  <TableCell className="text-right font-mono">
                    {stock.weightedPercentage.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="max-w-xs truncate" title={stock.appearsInSchemes.join(', ')}>
                      {stock.appearsInSchemes.length} scheme(s)
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
