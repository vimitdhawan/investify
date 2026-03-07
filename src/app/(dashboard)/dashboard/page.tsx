import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PortfolioChart } from '@/features/portfolio/components/portfolio-chart';
import { PortfolioOverviewCard } from '@/features/portfolio/components/portfolio-overview-card';
import { Button } from '@/components/ui/button';
import { getSessionUserId } from '@/lib/session';
import {
  getLatestPortfolio,
  getPortfolioSummaryByDate,
} from '@/features/portfolio/service';
import { PortfolioSummary } from '@/features/portfolio/type';
import { parseYYYYMMDDString } from '@/lib/utils/date';

export default async function Page() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }
  const latestPortfolio = await getLatestPortfolio(userId);
  if (!latestPortfolio) {
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

  const latestPortfolioDate = parseYYYYMMDDString(latestPortfolio.date);
  const previouDayDate = new Date(latestPortfolioDate); // clone
  previouDayDate.setDate(previouDayDate.getDate() - 1);

  const previousDayPortfolio = await getPortfolioSummaryByDate(
    userId,
    previouDayDate
  );

  const previousDayChange = previousDayPortfolio
    ? latestPortfolio.marketValue - previousDayPortfolio.marketValue
    : 0;
  const previousDayChangePercentage = previousDayPortfolio?.marketValue
    ? (previousDayChange / previousDayPortfolio.marketValue) * 100
    : 0;

  const promises: Promise<PortfolioSummary>[] = [];

  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(
      latestPortfolioDate.getFullYear(),
      latestPortfolioDate.getMonth() - i,
      1
    );
    promises.push(getPortfolioSummaryByDate(userId, targetDate));
  }
  const yearlyPortfolios = await Promise.all(promises);
  const filterYearlyPortfolio = yearlyPortfolios
    .filter((a): a is PortfolioSummary => a !== null)
    .sort(
      (a, b) =>
        parseYYYYMMDDString(a.date).getTime() -
        parseYYYYMMDDString(b.date).getTime()
    );
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 lg:px-6">
            <div className="md:w-2/5">
              <PortfolioOverviewCard
                portfolio={latestPortfolio}
                previousDayChange={previousDayChange}
                previousDayChangePercentage={previousDayChangePercentage}
              />
            </div>
            <div className="md:w-3/5">
              <PortfolioChart historicalData={filterYearlyPortfolio} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
