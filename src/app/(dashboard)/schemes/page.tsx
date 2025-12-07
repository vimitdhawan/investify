import { getSchemeSummary } from "@/lib/repository/portfolio";
import { SchemeCard } from "./components/scheme-card";

export default async function SchemesPage() {
  const schemeSummaries = await getSchemeSummary();

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {schemeSummaries.map((summary) => (
        <SchemeCard key={summary.schemeName} summary={summary} />
      ))}
    </div>
  );
}
