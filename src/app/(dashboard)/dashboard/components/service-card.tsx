"use client";
// components/top-services-card.tsx
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { TimeframeSelector } from "./service-time-selector";
import { ServicesBarChart } from "./service-bar-chart";
import { ServiceMetricDataPoint, ServiceAggregate } from "@/lib/types/metric";
import { dailyServiceData } from "@/lib/types/mock-data";
import { ChartConfig } from "@/components/ui/chart";

interface TopServicesCardProps {
  data?: ServiceMetricDataPoint[];
  referenceDate?: string;
}

const chartConfig: ChartConfig = {
  bookings: {
    label: "Bookings",
  },
  Haircut: {
    label: "Haircut",
    color: "hsl(var(--chart-1))",
  },
  Manicure: {
    label: "Manicure",
    color: "hsl(var(--chart-2))",
  },
  Massage: {
    label: "Massage",
    color: "hsl(var(--chart-3))",
  },
  Facial: {
    label: "Facial",
    color: "hsl(var(--chart-4))",
  },
  Pedicure: {
    label: "Pedicure",
    color: "hsl(var(--chart-5))",
  },
};

export const TopServicesCard: React.FC<TopServicesCardProps> = ({
  referenceDate = "2024-06-30",
}) => {
  const [timeframe, setTimeframe] = React.useState("today");

  // Aggregate data for the selected timeframe
  const getFilteredData = (): ServiceAggregate[] => {
    const refDate = new Date(referenceDate);
    let startDate = new Date(refDate);

    switch (timeframe) {
      case "today":
        startDate = refDate;
        break;
      case "week":
        startDate.setDate(refDate.getDate() - 7);
        break;
      case "month":
        startDate.setDate(refDate.getDate() - 30);
        break;
      case "threeMonths":
        startDate.setDate(refDate.getDate() - 90);
        break;
    }

    const filtered = dailyServiceData.map((item) => ({
      ...item,
      data: item.data.filter((d) => {
        const itemDate = new Date(d.date);
        return itemDate >= startDate && itemDate <= refDate;
      }),
    }));

    // Aggregate by service
    const aggregates = filtered.map(
      (curr) => {
        return {
          name: curr.service,
          bookings: curr.data.reduce((acc, curr) => acc + curr.bookings, 0),
          revenue: curr.data.reduce((acc, curr) => acc + curr.revenue, 0),
        };
      },
      {} as Record<string, ServiceAggregate>
    );

    // Convert to array, sort by bookings, and take top 5
    return Object.values(aggregates)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  };

  const services = getFilteredData();

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top-Selling Services</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]:inline">
            Most popular services by bookings
          </span>
          <span className="@[540px]:hidden">Top services</span>
        </CardDescription>
        <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
      </CardHeader>
      <CardContent>
        <ServicesBarChart services={services} config={chartConfig} />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 3.5% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing top services for{" "}
          {timeframe === "today"
            ? "today"
            : timeframe === "week"
              ? "this week"
              : timeframe === "month"
                ? "this month"
                : "last 3 months"}
        </div>
      </CardFooter>
    </Card>
  );
};
