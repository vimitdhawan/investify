import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { AnalysisSummaryCard } from '@/features/portfolio-analysis/components/AnalysisSummaryCard';
import { PortfolioOverlapCard } from '@/features/portfolio-analysis/components/PortfolioOverlapCard';
import { TopSectorsCard } from '@/features/portfolio-analysis/components/TopSectorsCard';
import { TopStocksCard } from '@/features/portfolio-analysis/components/TopStocksCard';
import { analyzePortfolio } from '@/features/portfolio-analysis/service';
import type { PortfolioScheme } from '@/features/portfolio-analysis/type';
import { getSchemes } from '@/features/schemes/service';

import { getSessionUserId } from '@/lib/session';

/**
 * Portfolio Analysis Page
 * Displays comprehensive analysis of portfolio holdings including top stocks,
 * sectors, and overlap matrix between schemes
 */
export default async function AnalysisPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  // Fetch user's schemes
  const schemes = await getSchemes(userId);

  if (!schemes || schemes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-2xl font-bold tracking-tight">No Portfolio Found</h3>
          <p className="text-sm text-muted-foreground">
            You need to upload a portfolio before viewing analysis.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/settings">Upload Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Convert to PortfolioScheme format
  const portfolioSchemes: PortfolioScheme[] = schemes
    .filter((s) => s.units > 0 && s.isin) // Only active schemes with ISINs
    .map((s) => ({
      id: s.id,
      name: s.name,
      isin: s.isin,
      marketValue: s.marketValue,
      units: s.units,
      amc: s.amc,
    }));

  if (portfolioSchemes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-2xl font-bold tracking-tight">No Active Holdings</h3>
          <p className="text-sm text-muted-foreground">
            Your portfolio has no active schemes with valid ISINs for analysis.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Perform analysis
  const analysis = await analyzePortfolio(portfolioSchemes);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Analysis</h2>
          <p className="text-muted-foreground">
            Deep insights into your portfolio&apos;s underlying holdings and sector exposure
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <AnalysisSummaryCard summary={analysis.summary} />

      {/* Top Holdings & Sectors */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <TopStocksCard stocks={analysis.topStocks} />
        <TopSectorsCard sectors={analysis.topSectors} />
      </div>

      {/* Portfolio Overlap */}
      {analysis.overlapMatrix && <PortfolioOverlapCard overlapMatrix={analysis.overlapMatrix} />}

      {!analysis.overlapMatrix && analysis.summary.totalSchemes > 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
          <p className="text-sm text-muted-foreground">
            Overlap analysis requires at least 2 schemes with holdings data
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Loading state for the analysis page
 */
export function Loading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[500px]" />
      </div>
      <Skeleton className="h-[200px] w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}
