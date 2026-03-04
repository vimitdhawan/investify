import { FundHousesClient } from '@/features/fund-houses/components/fund-houses-list';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation'; // Import the new client component
import { getFundHouses } from '@/features/fund-houses/service';

export default async function FundHousesPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  // const portfolio = await processPortfolio(userId);
  // const fundHouses = portfolio.mutualFunds;

  const fundHouses = await getFundHouses(userId);

  return <FundHousesClient mutualFunds={fundHouses} />;
}
