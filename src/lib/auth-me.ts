import type { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-errors';
import { fetchApiJson } from '@/lib/api-core';
import { authKeys } from '@/lib/auth-keys';
import { parseAuthClientProfileResponseBody } from '@/lib/parse-auth-client-profile-response';
import { bootstrapTelegramAuthFromWebApp } from '@/lib/telegram-auth';
import type { AuthClientProfile } from '@/types/auth-client-profile';

// TODO(next iteration): Remove legacy localStorage cleanup below once deployed users no longer
// have `gt_tg_client_profile` from the old profile-in-localStorage flow.
/** Former default for `NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY` (removed). */
const LEGACY_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY = 'gt_tg_client_profile';

let registeredAuthMeQueryClient: QueryClient | null = null;

/**
 * Registers the app QueryClient so non-React code (e.g. API 401 handlers) can clear `auth/me` cache.
 */
export function registerAuthMeQueryClient(queryClient: QueryClient): void {
  registeredAuthMeQueryClient = queryClient;
  removeLegacyTelegramClientProfileStorage();
}

// TODO: Cross-tab sync — `clearAuthMeProfileCache` only affects this tab; on 401,
// other tabs may still show a signed-in header until refocus/refetch (see TODO on `useMe`).
export function clearAuthMeProfileCache(): void {
  if (!registeredAuthMeQueryClient) {
    return;
  }
  setAuthMeProfileQueryData(registeredAuthMeQueryClient, null);
}

/** One-time migration: drop cached profile left by the removed localStorage auth flow. */
function removeLegacyTelegramClientProfileStorage(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(LEGACY_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Loads the current session profile from `GET v1/auth/me` (HttpOnly access cookie).
 * Returns `null` when unauthenticated.
 */
export async function fetchAuthMeProfile(): Promise<AuthClientProfile | null> {
  try {
    const raw = await fetchApiJson<unknown>('v1/auth/me', 'GET', undefined, {
      credentials: 'include',
    });
    const { profile } = parseAuthClientProfileResponseBody(raw);
    return profile;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      return null;
    }
    throw error;
  }
}

export function prefetchAuthMeProfile(queryClient: QueryClient): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey: authKeys.me(),
    queryFn: fetchAuthMeProfile,
  });
}

export function setAuthMeProfileQueryData(
  queryClient: QueryClient,
  profile: AuthClientProfile | null,
): void {
  queryClient.setQueryData(authKeys.me(), profile);
}

export function invalidateAuthMeQuery(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: authKeys.me() });
}

export async function bootstrapMiniAppSessionAndRefreshMe(queryClient: QueryClient): Promise<void> {
  const isBootstrapped = await bootstrapTelegramAuthFromWebApp();
  if (!isBootstrapped) {
    return;
  }
  await invalidateAuthMeQuery(queryClient);
}
