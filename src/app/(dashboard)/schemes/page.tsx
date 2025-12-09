import { getSchemeSummary } from "@/lib/repository/portfolio";
import { SchemeList } from "./components/scheme-list";

// Server Component to fetch data
export default async function SchemesPage() {
    const summaries = await getSchemeSummary();
    return <SchemeList summaries={summaries} />;
}
