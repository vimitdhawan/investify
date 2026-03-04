import { SchemeList } from '@/features/schemes/components/scheme-list';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation';
import { fetchSchemes, fetchSchemeNAV } from '@/features/schemes/service';
import { SchemeNavStatus } from '@/features/schemes/type';
import { parseDDMMYYYYString } from '@/lib/utils/date';

// Server Component to fetch data
export default async function SchemesPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const schemes = await fetchSchemes(userId);

  const dayChanges = new Map<string, number>();

  await Promise.all(
    schemes.map(async (scheme) => {
      if (
        scheme.schemdNavStatus == SchemeNavStatus.Available &&
        scheme.date != null
      ) {
        const date = parseDDMMYYYYString(scheme.date);
        const previousDayDate = new Date(date);
        previousDayDate.setDate(date.getDate() - 1);
        const previousDayNav = await fetchSchemeNAV(
          scheme.amfi,
          scheme.isin,
          previousDayDate
        );
        if (previousDayNav != null) {
          const previousDayChangePercentage = scheme.nav
            ? ((scheme.nav - Number(previousDayNav?.nav)) /
                Number(previousDayNav?.nav)) *
              100
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
