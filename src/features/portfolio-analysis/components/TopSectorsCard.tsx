'use client';

/**
 * TopSectorsCard Component
 * Displays top 5 sectors with chart and table
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

import type { AggregatedSector } from '../type';
import { BarChart, type BarChartDataPoint } from './BarChart';

interface TopSectorsCardProps {
  sectors: AggregatedSector[];
}

export function TopSectorsCard({ sectors }: TopSectorsCardProps) {
  if (!sectors || sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Sectors</CardTitle>
          <CardDescription>No sector data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData: BarChartDataPoint[] = sectors.map((sector) => ({
    label: sector.name,
    value: sector.weightedPercentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Sectors</CardTitle>
        <CardDescription>Sector exposure across your portfolio</CardDescription>
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
                <TableHead>Sector Name</TableHead>
                <TableHead className="text-right">Weight %</TableHead>
                <TableHead className="text-right">Unique Stocks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.map((sector, index) => (
                <TableRow key={sector.name}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {sector.weightedPercentage.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">{sector.stockCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
