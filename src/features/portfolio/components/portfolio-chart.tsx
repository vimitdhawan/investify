'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PortfolioSummary } from '@/features/portfolio/type';
import { formatCurrency } from '@/lib/utils';

const chartConfig = {
  marketValue: {
    label: 'MV',
    theme: {
      light: 'var(--chart-2)',
      dark: 'var(--chart-2)',
    },
  },
  investedValue: {
    label: 'CV',
    theme: {
      light: 'var(--chart-1)',
      dark: 'var(--chart-1)',
    },
  },
} satisfies ChartConfig;

interface PortfolioChartProps {
  historicalData: PortfolioSummary[];
}

export function PortfolioChart({ historicalData }: PortfolioChartProps) {
  const chartData = historicalData.map((pf) => ({
    date: new Date(pf.date!).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    marketValue: pf.marketValue,
    investedValue: pf.investedValue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Trend</CardTitle>
        <CardDescription>
          Market value vs. Invested value over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ right: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => {
                  if (typeof value === 'number') {
                    return new Intl.NumberFormat('en-IN', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(value);
                  }
                  return value;
                }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => {
                      const label =
                        chartConfig[name as keyof typeof chartConfig]?.label;
                      return (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold">{label}:</span>
                          <span className="ml-4 font-mono font-medium tabular-nums">
                            {formatCurrency(value as number)}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <defs>
                <linearGradient
                  id="fillMarketValue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-marketValue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-marketValue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="fillInvestedValue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-investedValue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-investedValue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="investedValue"
                type="natural"
                fill="url(#fillInvestedValue)"
                stroke="var(--color-investedValue)"
              />
              <Area
                dataKey="marketValue"
                type="natural"
                fill="url(#fillMarketValue)"
                stroke="var(--color-marketValue)"
              />
              <ChartLegend
                content={({ payload }) => (
                  <ChartLegendContent
                    payload={payload}
                    className="mt-4 gap-8"
                  />
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
