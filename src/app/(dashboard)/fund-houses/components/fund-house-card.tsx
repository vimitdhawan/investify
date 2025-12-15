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
import { MutualFund } from "@/lib/types/mutual-fund";

interface FundHouseCardProps {
  mutualFund: MutualFund;
}

export function FundHouseCard({ mutualFund }: FundHouseCardProps) {
    const isGain = (mutualFund?.absoluteGainLoss ?? 0) >= 0;
    const gainLossColorClass = isGain ? "text-green-500" : "text-red-500";
    const Icon = isGain ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{mutualFund.name}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {mutualFund.marketValue && mutualFund.marketValue.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </CardTitle>
        <div className={cn("flex gap-1", gainLossColorClass)}>
            <Icon className="size-4" />
            {mutualFund.absoluteGainLossPercentage && `${mutualFund.absoluteGainLossPercentage.toFixed(2)}%`}
          </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Invested: {mutualFund.investedAmount.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </div>
        <div className={cn("line-clamp-1 flex gap-2 font-medium", gainLossColorClass)}>
            {mutualFund.absoluteGainLoss && mutualFund.absoluteGainLoss.toLocaleString("en-IN", {
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
          Realized Profit: {mutualFund.realizedGainLoss && mutualFund.realizedGainLoss.toLocaleString("en-IN", {
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
