import { fetchApiJson } from '@/lib/api-core';
import {
  parseAuthClientProfileResponse,
  setStoredTelegramClientProfile,
} from '@/lib/telegram/telegram-auth';

/**
 * Refreshes the cookie session and synchronizes the returned client profile with the UI store.
 */
export async function postAuthRefresh(): Promise<void> {
  const raw = await fetchApiJson<unknown>('v1/auth/refresh', 'POST', undefined, {
    credentials: 'include',
  });
  const { profile } = parseAuthClientProfileResponse(raw);
  setStoredTelegramClientProfile(profile);
}
