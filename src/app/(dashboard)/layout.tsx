import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { getPortfolio } from '@/features/portfolio/repository';
import { AppSidebar } from '@/features/side-bar/components/app-sidebar';
import { SiteHeader } from '@/features/side-bar/components/site-header';

import { getSessionUserId } from '@/lib/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  const portfolio = userId ? await getPortfolio(userId) : null;
  const user = portfolio?.investor;

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
        <AppSidebar variant="inset" user={user} />
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
