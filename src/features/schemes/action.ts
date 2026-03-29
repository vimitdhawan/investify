'use server';

import { getSchemes } from '@/features/schemes/service';

import { getSessionUserId } from '@/lib/session';

export async function getSchemeAction(schemeId: string) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  const schemes = await getSchemes(userId);
  return schemes.find((s) => s.id === schemeId);
}
