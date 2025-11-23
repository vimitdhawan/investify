"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";

import { AreaMetricDataPoint } from "@/lib/types/metric";
import { TimeRangeSelector } from "./area-chart-range-selector";
import { AreaChartContainer } from "./area-chart-container";

export const description = "An interactive area chart";

interface MetricChartProps {
  title: string;
  description: string;
  data: AreaMetricDataPoint[];
  config: ChartConfig;
  dataKeys: string[];
  defaultTimeRange?: "7d" | "30d" | "90d";
  referenceDate?: string;
}

// Main Metric Chart Component
export const MetricChart: React.FC<MetricChartProps> = ({
  title,
  description,
  data,
  config,
  dataKeys,
  defaultTimeRange = "90d",
  referenceDate = "2024-06-30",
}) => {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState(defaultTimeRange);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const refDate = new Date(referenceDate);
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{description}</span>
          <span className="@[540px]/card:hidden">{description}</span>
        </CardDescription>
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <AreaChartContainer
          data={filteredData}
          config={config}
          dataKeys={dataKeys}
        />
      </CardContent>
    </Card>
  );
};
