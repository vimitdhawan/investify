"use client";

import * as React from "react";
import { SectionCard } from "./section-card";
import { Portfolio } from "@/lib/types/portfolio";

// Helper to format Date object to YYYY-MM-DD string
function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}



export function DashboardClient({ portfolio, mostRecentNavDate }: { portfolio: Portfolio, mostRecentNavDate: Date | null }) {
  const [previousDayPortfolio, setPreviousDayPortfolio] = React.useState<Portfolio | null>(null);

  React.useEffect(() => {
    const fetchPreviousDayData = async () => {
        if (mostRecentNavDate) {
            const previousDayDate = new Date(mostRecentNavDate);
            previousDayDate.setDate(previousDayDate.getDate() - 1);
            const dateString = formatDateToYYYYMMDD(previousDayDate);
            
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

  const previousDayChange = previousDayPortfolio ? portfolio.marketValue - previousDayPortfolio.marketValue : 0;
  const previousDayChangePercentage = previousDayPortfolio?.marketValue ? (previousDayChange / previousDayPortfolio.marketValue) * 100 : 0 ;

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

    </div>
  );
}
