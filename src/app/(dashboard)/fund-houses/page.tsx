import { populatePortfolioCache } from "@/lib/repository/portfolio";
import { FundHouseCard } from "./components/fund-house-card";

export default async function FundHousesPage() {
  const portfolio = await populatePortfolioCache();

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {portfolio.mutualFunds.map((mutualFund) => (
        <FundHouseCard key={mutualFund.id} mutualFund={mutualFund} />
      ))}
    </div>
  );
}
