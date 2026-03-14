import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from '@/features/side-bar/components/app-sidebar';
import { SiteHeader } from '@/features/side-bar/components/site-header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-grow">
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
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
