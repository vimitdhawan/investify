import { processPortfolio } from '@/lib/repository/portfolio';
import { FundHousesClient } from '../../../features/fund-houses/components/fund-houses-client';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation'; // Import the new client component

export default async function FundHousesPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const portfolio = await processPortfolio(userId);

  return <FundHousesClient mutualFunds={portfolio.mutualFunds} />;
}
