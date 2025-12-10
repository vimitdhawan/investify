import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SectionCardProps {
    title: string;
    value: number;
    description?: string;
    change?: number;
    changePercentage?: number;
}

export function SectionCard({
  title,
  value,
  description,
  change,
  changePercentage,
}: SectionCardProps) {
  const isGain = change ? change >= 0 : undefined;
  const gainLossColorClass = isGain === undefined ? "" : isGain ? "text-green-500" : "text-red-500";
  const Icon = isGain === undefined ? null : isGain ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatCurrency(value)}
        </CardTitle>
      </CardHeader>
      {(change !== undefined && changePercentage !== undefined && Icon) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={cn("flex items-center gap-2 font-medium", gainLossColorClass)}>
            <Icon className="size-4" />
            <span>{`${formatCurrency(change)} (${changePercentage.toFixed(2)}%)`}</span>
          </div>
          {description && <div className="text-muted-foreground">{description}</div>}
        </CardFooter>
      )}
    </Card>
  );
}
