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
import { SchemeSummary } from "@/lib/types/summary";
import Link from "next/link";

interface SchemeCardProps {
  summary: SchemeSummary;
}

export function SchemeCard({ summary }: SchemeCardProps) {
    const isGain = summary.absoluteGainLoss >= 0;
    const gainLossColorClass = isGain ? "text-green-500" : "text-red-500";
    const Icon = isGain ? IconTrendingUp : IconTrendingDown;

  return (
    <Link href={`/schemes/${summary.isin}/transactions?folio=${summary.folio_number}`}>
      <Card className="@container/card">
        <CardHeader className="flex flex-col gap-2">
          <CardDescription className="text-base font-semibold">
            {summary.schemeName}
          </CardDescription>
          <div className="text-sm text-muted-foreground">{`Folio: ${summary.folio_number}`}</div>

          <div className="flex items-baseline justify-between pt-2">
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                {summary.marketValue.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </CardTitle>
          </div>

          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Invested:</span>
            <span className="font-medium">
                {summary.investedValue.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </span>
          </div>
          
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={cn("flex items-baseline justify-between w-full text-base", gainLossColorClass)}>
            <div className="flex items-center gap-1">
                <Icon className="size-4" />
                <span className="text-muted-foreground">Abs. Gain/Loss:</span>
            </div>
            <span className="font-medium">
                {summary.absoluteGainLoss.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
                 {` (${summary.absoluteGainLossPercentage?.toFixed(2)}%)`}
            </span>
          </div>

          {summary.realizedProfit !== 0 && (
            <div className="flex items-baseline justify-between w-full">
                <span className="text-muted-foreground">Realized Profit:</span>
                <span className="font-medium">
                    {summary.realizedProfit.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            </div>
          )}
          
          <div className="h-px w-full bg-border my-1" /> {/* Separator */}

          {summary.navValue && summary.latestNavDate && (
            <>
              <div className="flex items-baseline justify-between w-full">
                <span className="text-muted-foreground">NAV:</span>
                <span className="font-medium">
                    {summary.navValue.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
              </div>
              <div className="flex items-baseline justify-between w-full">
                <span className="text-muted-foreground">NAV Date:</span>
                <span className="font-medium">{summary.latestNavDate}</span>
              </div>
            </>
          )}
          {summary.totalAvailableUnits !== undefined && (
            <div className="flex items-baseline justify-between w-full">
              <span className="text-muted-foreground">Units:</span>
              <span className="font-medium">
                {summary.totalAvailableUnits.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
