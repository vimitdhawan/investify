'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import { usePathname } from 'next/navigation';
import { data } from '@/features/side-bar/type';

export function SiteHeader() {
  const pathname: string = usePathname();
  // Automatically match route if title/description aren't provided
  const matchedMenu = data.find((item) => pathname.startsWith(item.url));

  return (
    <header className="flex h-16 shrink-0 items-center border-b px-4 py-3 transition-all ease-linear sm:h-16 sm:py-4 lg:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-5"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-medium leading-tight sm:text-xl">
              {matchedMenu?.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {matchedMenu?.description}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
