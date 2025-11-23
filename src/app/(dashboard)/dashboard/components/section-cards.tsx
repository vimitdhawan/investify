import { getPortfolioSummary } from "@/lib/repository/portfolio";
import { SectionCard } from "./section-card";
import { MetricType, SectionMetric } from "@/lib/types/metric";

export default async function SectionCards() {
  const portfolioSummary = await getPortfolioSummary();

  const metrics: SectionMetric[] = [
    {
      title: "Invested Value",
      value: portfolioSummary.investedValue,
    },
    {
      title: "Market Value",
      value: portfolioSummary.marketValue,
    },
    {
      title: "Absolute Gain/Loss",
      value: portfolioSummary.absoluteGainLoss,
    },
    {
      title: "Absolute Gain/Loss Percentage",
      value: portfolioSummary.absoluteGainLossPercentage,
    },
    {
      title: "Realized Profit",
      value: portfolioSummary.realizedProfit,
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {metrics.map((metric) => (
        <SectionCard
          metric={metric}
        />
      ))}
    </div>
  );
}
