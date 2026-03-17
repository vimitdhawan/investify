import { redirect } from 'next/navigation';

import { getPortfolio } from '@/features/portfolio/repository';
import { SettingsView } from '@/features/settings/components/settings-view';

import { getSessionUserId } from '@/lib/session';

export default async function SettingsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const portfolio = await getPortfolio(userId);

  if (!portfolio) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground text-lg italic">
          No portfolio data found. Please ensure you have imported your CAS statement.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <div className="flex-1 overflow-auto">
        <SettingsView investor={portfolio.investor} statements={portfolio.statements} />
      </div>
    </div>
  );
}
