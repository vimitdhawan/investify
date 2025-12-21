"use client";

import * as React from "react";
import { PortfolioOverviewCard } from "./portfolio-overview-card";
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 lg:px-6">
      <div className="md:w-2/5">
        <PortfolioOverviewCard
          portfolio={portfolio}
          previousDayChange={previousDayChange}
          previousDayChangePercentage={previousDayChangePercentage}
        />
      </div>
      <div className="md:w-3/5">
        <div className="h-full rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center p-4">
          <p className="text-muted-foreground text-center">
            Placeholder for 1-month Market Value and Invested Value Graph
          </p>
        </div>
      </div>
    </div>
  );
}
