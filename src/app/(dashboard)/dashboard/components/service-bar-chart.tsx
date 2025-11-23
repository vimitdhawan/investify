// components/services-bar-chart.tsx
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ServiceAggregate } from "@/lib/types/metric";
import { ChartConfig } from "@/components/ui/chart";

interface ServicesBarChartProps {
  services: ServiceAggregate[];
  config: ChartConfig;
}

export const ServicesBarChart: React.FC<ServicesBarChartProps> = ({
  services,
  config,
}) => {
  const chartData = services.map((service) => ({
    service: service.name,
    bookings: service.bookings,
    revenue: service.revenue,
    fill: `var(--color-${service.name.toLowerCase().replace(" ", "-")})`,
  }));

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 10 }}
      >
        <YAxis
          dataKey="service"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => config[value]?.label || value}
        />
        <XAxis dataKey="bookings" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => {
                if (name === "bookings") {
                  return (
                    <>
                      <div>Bookings: {value}</div>
                      <div>
                        Revenue: ${item.payload.revenue.toLocaleString()}
                      </div>
                    </>
                  );
                }
                return null;
              }}
            />
          }
        />
        <Bar dataKey="bookings" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  );
};
