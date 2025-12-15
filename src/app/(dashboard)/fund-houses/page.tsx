import { populatePortfolioCache } from "@/lib/repository/portfolio";
import { FundHousesClient } from "./components/fund-houses-client"; // Import the new client component

export default async function FundHousesPage() {
  const portfolio = await populatePortfolioCache();

  return (
    <FundHousesClient mutualFunds={portfolio.mutualFunds} />
  );
}
