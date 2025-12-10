import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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

function FinancialDetail({ label, value, valueClass, isLoss = false }: { label: string, value: string, valueClass?: string, isLoss?: boolean }) {
    return (
        <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("font-medium", valueClass)}>
                {value}
            </span>
        </div>
    );
}

export function SchemeCard({ summary }: SchemeCardProps) {
  const isClosed = summary.marketValue === 0;
  const isGain = isClosed ? summary.realizedProfit >= 0 : summary.absoluteGainLoss >= 0;
  const gainLossColorClass = isGain ? "text-green-500" : "text-red-500";

  const primaryValue = isClosed ? summary.withdrawalAmount : summary.marketValue;
  const primaryLabel = isClosed ? "Withdrawn" : "Market Value";

  return (
    <Link href={`/schemes/${summary.isin}/transactions?folio=${summary.folio_number}`} className="flex">
      <Card className="flex flex-col w-full @container/card">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <CardTitle className="text-base font-semibold leading-snug">
                {summary.schemeName}
              </CardTitle>
              <CardDescription className="text-xs pt-1">{`Folio: ${summary.folio_number}`}</CardDescription>
            </div>
            <Badge variant={isClosed ? "destructive" : "default"} className="ml-2 whitespace-nowrap">
              {isClosed ? "Closed" : "Active"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 text-sm flex-grow">
            <FinancialDetail 
                label={primaryLabel}
                value={primaryValue?.toLocaleString("en-IN", {
                    style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2,
                }) ?? "N/A"}
            />
            <FinancialDetail 
                label="Invested"
                value={summary.investedValue.toLocaleString("en-IN", {
                    style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2,
                })}
            />
            {!isClosed && (
                <FinancialDetail 
                    label="Abs. Gain/Loss"
                    value={`${summary.absoluteGainLoss.toLocaleString("en-IN", {
                        style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2,
                    })} (${summary.absoluteGainLossPercentage?.toFixed(2)}%)`}
                    valueClass={gainLossColorClass}
                />
            )}
            {summary.realizedProfit !== 0 && (
                <FinancialDetail 
                    label="Realized Profit"
                    value={summary.realizedProfit.toLocaleString("en-IN", {
                        style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2,
                    })}
                    valueClass={gainLossColorClass}
                />
            )}
        </CardContent>

        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground pt-4">
          <div className="h-px w-full bg-border mb-2" />
          
          {summary.navValue && summary.latestNavDate && (
            <div className="flex justify-between w-full">
              <span>NAV: {summary.navValue.toFixed(2)} as on {summary.latestNavDate}</span>
            </div>
          )}
          {summary.totalAvailableUnits !== undefined && summary.totalAvailableUnits > 0 && (
            <div className="flex justify-between w-full">
              <span>Units: {summary.totalAvailableUnits.toFixed(4)}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
