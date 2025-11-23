import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/side-bar/site-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-grow">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
