import * as React from "react";
import { PortfolioOverviewCard } from "./portfolio-overview-card";
import { getLastNDaysPortfolio, getPortfolioForLastYearByMonth } from "@/lib/repository/portfolio";
import { PortfolioChart } from "./portfolio-chart";

export async function DashboardClient() {
  const dailyPortfolios = await getLastNDaysPortfolio(2);
  const portfolio = dailyPortfolios[1];
  const previousDayPortfolio = dailyPortfolios[0];

  const yearlyPortfolios = await getPortfolioForLastYearByMonth();

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
        <PortfolioChart historicalData={yearlyPortfolios} />
      </div>
    </div>
  );
}
