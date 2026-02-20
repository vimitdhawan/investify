import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  getLastNDaysPortfolio,
  getPortfolioForLastYearByMonth,
} from '@/lib/repository/portfolio';
import { PortfolioChart } from './portfolio-chart';
import { PortfolioOverviewCard } from './portfolio-overview-card';
import { Button } from '@/components/ui/button';
import { getSessionUserId } from '@/lib/session';

export async function DashboardClient() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const dailyPortfolios = await getLastNDaysPortfolio(userId, 2);

  if (dailyPortfolios.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No Portfolio Found
          </h3>
          <p className="text-sm text-muted-foreground">
            You have not uploaded a portfolio yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings">Upload Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const portfolio = dailyPortfolios[dailyPortfolios.length - 1];
  const previousDayPortfolio =
    dailyPortfolios.length > 1 ? dailyPortfolios[0] : null;

  const yearlyPortfolios = await getPortfolioForLastYearByMonth(userId);

  const previousDayChange = previousDayPortfolio
    ? portfolio.marketValue - previousDayPortfolio.marketValue
    : 0;
  const previousDayChangePercentage = previousDayPortfolio?.marketValue
    ? (previousDayChange / previousDayPortfolio.marketValue) * 100
    : 0;

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
