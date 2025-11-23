"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { AreaMetricDataPoint } from "@/lib/types/metric";

// Generic Chart Component
interface ChartContainerProps {
  data: AreaMetricDataPoint[];
  config: ChartConfig;
  dataKeys: string[];
}

export const AreaChartContainer: React.FC<ChartContainerProps> = ({
  data,
  config,
  dataKeys,
}) => {
  const isMobile = useIsMobile();

  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <AreaChart data={data}>
        <defs>
          {dataKeys.map((key) => (
            <linearGradient
              key={key}
              id={`fill${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={`var(--color-${key})`}
                stopOpacity={1.0}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={false}
          defaultIndex={isMobile ? -1 : 10}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              indicator="dot"
            />
          }
        />
        {dataKeys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="natural"
            fill={`url(#fill${key})`}
            stroke={`var(--color-${key})`}
            stackId="a"
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};
