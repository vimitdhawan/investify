import { IconInnerShadowTop } from '@tabler/icons-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { Investor } from '@/features/portfolio/type';
import { NavMain } from '@/features/side-bar/components/nav-main';
import { NavUser } from '@/features/side-bar/components/nav-user';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: Investor;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <span>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">SaarthiFlow</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
