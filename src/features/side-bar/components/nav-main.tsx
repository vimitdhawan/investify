'use client';

import { IconCirclePlusFilled } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { data } from '@/features/side-bar/type';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export function NavMain() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (url: string) => pathname.startsWith(url);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="w-48"></SidebarMenu>
        <SidebarMenu>
          {data.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={isActive(item.url)}
                className={cn(
                  'relative transition-all duration-200',
                  isActive(item.url) && [
                    'font-medium',
                    'before:absolute before:left-0 before:top-1/2 before:h-8 before:w-1 before:-translate-y-1/2 before:rounded-r-md before:bg-primary',
                    'after:absolute after:inset-0 after:rounded-md after:bg-primary/10 after:opacity-50 after:transition-opacity',
                    'hover:after:opacity-100',
                  ]
                )}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
