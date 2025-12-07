import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FundHouseSummary } from "@/lib/types/summary";

interface FundHouseCardProps {
  summary: FundHouseSummary;
}

export function FundHouseCard({ summary }: FundHouseCardProps) {
    const isGain = summary.absoluteGainLoss >= 0;
    const gainLossColorClass = isGain ? "text-green-500" : "text-red-500";
    const Icon = isGain ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{summary.amc}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.marketValue.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </CardTitle>
        <div className={cn("flex gap-1", gainLossColorClass)}>
            <Icon className="size-4" />
            {`${summary.absoluteGainLossPercentage.toFixed(2)}%`}
          </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Invested: {summary.investedValue.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </div>
        <div className={cn("line-clamp-1 flex gap-2 font-medium", gainLossColorClass)}>
            {summary.absoluteGainLoss.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </div>
        <div className="text-muted-foreground">
          Absolute Gain/Loss
        </div>
        <div className="text-muted-foreground">
          Realized Profit: {summary.realizedProfit.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </div>
      </CardFooter>
    </Card>
  );
}
