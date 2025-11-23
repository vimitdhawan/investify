import { ChartAreaInteractive } from "./components/area-chart-cards";
import  SectionCards  from "./components/section-cards";
import { TopServicesCard } from "./components/service-card";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6 space-y-6">
            <TopServicesCard />
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
