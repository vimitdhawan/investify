import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { SectionMetric, MetricType } from "@/lib/types/metric";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCard({
  metric,
}: {
  metric: SectionMetric;
}) {

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{metric.title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {metric.value.toFixed(2)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
