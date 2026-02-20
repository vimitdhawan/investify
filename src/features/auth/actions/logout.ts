'use server';

import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/session';

export async function handleLogout(callbackUrl?: string) {
  await deleteSession();
  const safeRedirect =
    callbackUrl && callbackUrl !== '/login'
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login';

  redirect(safeRedirect);
}
