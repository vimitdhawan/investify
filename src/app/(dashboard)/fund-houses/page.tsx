import { processPortfolio } from '@/lib/repository/portfolio';
import { FundHousesClient } from './components/fund-houses-client'; // Import the new client component

export default async function FundHousesPage() {
  const portfolio = await processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3');

  return <FundHousesClient mutualFunds={portfolio.mutualFunds} />;
}
