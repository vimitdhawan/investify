import { getFundHouseSummary } from "@/lib/repository/portfolio";
import { FundHouseCard } from "./components/fund-house-card";

export default async function FundHousesPage() {
  const fundHouseSummaries = await getFundHouseSummary();

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {fundHouseSummaries.map((summary) => (
        <FundHouseCard key={summary.amc} summary={summary} />
      ))}
    </div>
  );
}
