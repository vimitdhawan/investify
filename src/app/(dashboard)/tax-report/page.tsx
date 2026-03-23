import { redirect } from 'next/navigation';

import { getSchemes } from '@/features/schemes/service';
import { FiscalYearSelect } from '@/features/tax-report/components/FiscalYearSelect';
import { RealizedGainsTable } from '@/features/tax-report/components/RealizedGainsTable';
import { TaxSlabSelect } from '@/features/tax-report/components/TaxSlabSelect';
import { TaxSummaryCards } from '@/features/tax-report/components/TaxSummaryCards';
import { calculateRealizedGainsDetailed, calculateTaxSummary } from '@/features/tax-report/service';

import { getSessionUserId } from '@/lib/session';
import { getCurrentFiscalYear } from '@/lib/utils/date';

export default async function TaxReportPage({
  searchParams,
}: {
  searchParams: Promise<{ fy?: string; slab?: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const { fy, slab } = await searchParams;
  const currentFY = fy || getCurrentFiscalYear();
  const currentSlab = slab || '30'; // Default to 30% if not specified
  const taxSlabPercentage = parseInt(currentSlab, 10);

  const schemes = await getSchemes(userId);

  const allRealizedGains = schemes.flatMap((scheme) =>
    calculateRealizedGainsDetailed(
      scheme.transactions,
      scheme.id,
      scheme.name,
      scheme.type,
      scheme.folioNumber
    )
  );

  // Filter by selected fiscal year
  const filteredGains = allRealizedGains.filter((g) => g.fiscalYear === currentFY);

  // Calculate tax summary (includes tax paid from transactions)
  const taxSummary = calculateTaxSummary(filteredGains, taxSlabPercentage);

  // Get all available fiscal years for the dropdown
  const availableFYs = Array.from(new Set(allRealizedGains.map((g) => g.fiscalYear)))
    .sort()
    .reverse();
  if (availableFYs.length === 0) {
    availableFYs.push(getCurrentFiscalYear());
  } else if (!availableFYs.includes(getCurrentFiscalYear())) {
    availableFYs.unshift(getCurrentFiscalYear());
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tax Report</h1>
          <p className="text-muted-foreground">
            Realized capital gains and estimated tax liabilities for {currentFY}.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <TaxSlabSelect currentSlab={currentSlab} />
          <FiscalYearSelect availableFYs={availableFYs} currentFY={currentFY} />
        </div>
      </div>

      <TaxSummaryCards taxSummary={taxSummary} taxSlabPercentage={taxSlabPercentage} />

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Detailed Realized Gains</h2>
        <RealizedGainsTable gains={filteredGains} />
      </div>
    </div>
  );
}
