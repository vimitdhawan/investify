import { getPortfolioSummaryWithPrevDay } from "@/lib/repository/portfolio";
import { DashboardClient } from "./components/dashboard-client";

export default async function Page() {
  const summary = await getPortfolioSummaryWithPrevDay();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DashboardClient summary={summary} />
        </div>
      </div>
    </div>
  );
}
