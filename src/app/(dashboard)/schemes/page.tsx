import { redirect } from 'next/navigation';

import { SchemeList } from '@/features/schemes/components/scheme-list';
import { fetchSchemeNAVByDate, getSchemeViews } from '@/features/schemes/service';
import { SchemeNavStatus } from '@/features/schemes/type';

import { getSessionUserId } from '@/lib/session';
import { parseYYYYMMDDString } from '@/lib/utils/date';

// Server Component to fetch data
export default async function SchemesPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const schemes = await getSchemeViews(userId);

  const dayChanges = new Map<string, number>();

  await Promise.all(
    schemes.map(async (scheme) => {
      if (scheme.schemdNavStatus === SchemeNavStatus.Available && scheme.lastNavDate !== null) {
        const previousDayDate = new Date(scheme.lastNavDate);
        previousDayDate.setDate(parseYYYYMMDDString(scheme.lastNavDate).getDate() - 1);
        const previousDayNav = await fetchSchemeNAVByDate(
          scheme.amfi,
          scheme.isin,
          previousDayDate
        );
        if (previousDayNav != null) {
          const previousDayChangePercentage = scheme.nav
            ? ((scheme.nav - Number(previousDayNav?.nav)) / Number(previousDayNav?.nav)) * 100
            : 0;
          dayChanges.set(scheme.id, previousDayChangePercentage);
        } else {
          dayChanges.set(scheme.id, 10);
        }
      }
    })
  );

  return <SchemeList schemes={schemes} dayChanges={dayChanges} />;
}
