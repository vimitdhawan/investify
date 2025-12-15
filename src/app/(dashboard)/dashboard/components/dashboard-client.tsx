"use client";

import * as React from "react";
import { SectionCard } from "./section-card";
import { DatePicker } from "@/components/ui/date-picker";
import { Portfolio } from "@/lib/types/portfolio";


export function DashboardClient({ portfolio, mostRecentNavDate }: { portfolio: Portfolio, mostRecentNavDate: Date | null }) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [historicalPortfolio, setHistoricalPortfolio] = React.useState<Portfolio | null>(null);
  const [previousDayPortfolio, setPreviousDayPortfolio] = React.useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchPreviousDayData = async () => {
        if (mostRecentNavDate) {
            const previousDayDate = new Date(mostRecentNavDate);
            previousDayDate.setDate(previousDayDate.getDate() - 1);
            const dateString = previousDayDate.toISOString().split('T')[0];
            
            try {
                const res = await fetch(`/api/portfolio?date=${dateString}`);
                const data = await res.json();
                setPreviousDayPortfolio(data);
            } catch (error) {
                console.error("Failed to fetch previous day portfolio value", error);
            }
        }
    };
    fetchPreviousDayData();
  }, [mostRecentNavDate]);

  React.useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      fetch(`/api/portfolio?date=${dateString}`)
        .then(res => res.json())
        .then(data => {
            setHistoricalPortfolio(data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Failed to fetch historical value", error);
            setIsLoading(false);
        });
    }
  }, [selectedDate]);

  const previousDayChange = previousDayPortfolio ? portfolio.marketValue - previousDayPortfolio.marketValue : 0;
  const previousDayChangePercentage = previousDayPortfolio?.marketValue ? (previousDayChange / previousDayPortfolio.marketValue) * 100 : 0 ;

  const historicalGainLoss = historicalPortfolio ? portfolio.marketValue - historicalPortfolio.marketValue : undefined;
  const historicalGainLossPercentage = historicalPortfolio && historicalGainLoss ? (historicalGainLoss / historicalPortfolio.marketValue) * 100 : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Portfolio Overview</h2>
        {portfolio.date && (
          <p className="text-sm text-muted-foreground">
            Latest NAV as of: {portfolio.date}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <SectionCard
          title="Market Value"
          value={portfolio.marketValue}
          change={previousDayChange}
          changePercentage={previousDayChangePercentage}
          description="vs. Previous Day"
        />
        <SectionCard
          title="Invested Amount"
          value={portfolio.investedValue}
        />
        <SectionCard
          title="Absolute Gain/Loss"
          value={portfolio.absoluteGainLoss}
          changePercentage={portfolio.absoluteGainLossPercentage}
        />
        <SectionCard
          title="Realized Profit"
          value={portfolio.realizedGainLoss}
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
                {historicalPortfolio && historicalGainLoss !== undefined && !isLoading && (
                    <SectionCard
                        title={`Value on ${selectedDate?.toLocaleDateString()}`}
                        value={historicalPortfolio.marketValue}
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
