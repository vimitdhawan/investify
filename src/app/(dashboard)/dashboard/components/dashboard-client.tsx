"use client";

import * as React from "react";
import { DashboardSummary } from "@/lib/types/summary";
import { SectionCard } from "./section-card";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/lib/utils";

export function DashboardClient({ summary }: { summary: DashboardSummary }) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [historicalValue, setHistoricalValue] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      fetch(`/api/portfolio/historical-value?date=${dateString}`)
        .then(res => res.json())
        .then(data => {
          if (data.historicalValue) {
            setHistoricalValue(data.historicalValue);
          }
          setIsLoading(false);
        })
        .catch(error => {
            console.error("Failed to fetch historical value", error);
            setIsLoading(false);
        });
    }
  }, [selectedDate]);

  const historicalGainLoss = historicalValue ? summary.marketValue - historicalValue : undefined;
  const historicalGainLossPercentage = historicalValue && historicalGainLoss ? (historicalGainLoss / historicalValue) * 100 : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Portfolio Overview</h2>
        {summary.latestNavDate && (
          <p className="text-sm text-muted-foreground">
            Latest NAV as of: {summary.latestNavDate}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <SectionCard
          title="Market Value"
          value={summary.marketValue}
          change={summary.prevDayChange}
          changePercentage={summary.prevDayChangePercentage}
          description="vs. Previous Day"
        />
        <SectionCard
          title="Invested Amount"
          value={summary.investedValue}
        />
        <SectionCard
          title="Absolute Gain/Loss"
          value={summary.absoluteGainLoss}
          changePercentage={summary.absoluteGainLossPercentage}
        />
        <SectionCard
          title="Realized Profit"
          value={summary.realizedProfit}
        />
      </div>

      <div className="px-4 lg:px-6">
        <div className="p-4 border rounded-lg flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
                <h3 className="font-semibold mb-2">Compare with Past</h3>
                <p className="text-sm text-muted-foreground mb-4">Select a date to see the absolute gain/loss from that day to the present.</p>
                <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
            <div className="flex-1 w-full">
                {isLoading && <p>Loading historical data...</p>}
                {historicalValue !== null && historicalGainLoss !== undefined && !isLoading && (
                    <SectionCard
                        title={`Value on ${selectedDate?.toLocaleDateString()}`}
                        value={historicalValue}
                        change={historicalGainLoss}
                        changePercentage={historicalGainLossPercentage}
                        description={`Gain/Loss since ${selectedDate?.toLocaleDateString()}`}
                    />
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
