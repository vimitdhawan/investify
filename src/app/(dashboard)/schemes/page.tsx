import {
  processPortfolio,
  processNAVDate,
  mostRecentNavDate,
} from '@/lib/repository/portfolio';
import { SchemeList } from './components/scheme-list';
import { SchemeView } from '@/lib/types/scheme';

// Server Component to fetch data
export default async function SchemesPage() {
  const portfolio = await processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3');
  const schemes = portfolio.mutualFunds.flatMap((mf) => mf.schemes);

  const dayChanges = new Map<string, number>();

  await Promise.all(
    schemes.map(async (scheme) => {
      const previousDayDate = new Date(mostRecentNavDate!);
      previousDayDate.setDate(previousDayDate.getDate() - 1);
      const previousDayNav = await processNAVDate(
        scheme.amfi,
        scheme.isin,
        previousDayDate
      );
      const previousDayChangePercentage = scheme.nav
        ? ((scheme.nav - Number(previousDayNav.nav)) /
            Number(previousDayNav.nav)) *
          100
        : 0;
      dayChanges.set(scheme.id, previousDayChangePercentage);
    })
  );

  return <SchemeList schemes={schemes} dayChanges={dayChanges} />;
}
