import { chartData } from "./chart-data";

import { ChartConfig } from "@/components/ui/chart";
import { MetricChart } from "./area-chart-card";
import { mockAreaMetrics } from "@/lib/types/metric";

const chartConfig: ChartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
};

export function ChartAreaInteractive() {
  return (
    <div className="space-y-6">
      {mockAreaMetrics.map((metric) => (
        <MetricChart
          key={metric.type}
          title={metric.title}
          description={metric.description}
          data={chartData}
          config={chartConfig}
          dataKeys={["desktop", "mobile"]}
        />
      ))}
    </div>
  );
}
