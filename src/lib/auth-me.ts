import type { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-errors';
import { fetchApiJson } from '@/lib/api-core';
import { authKeys } from '@/lib/auth-keys';
import { parseAuthClientProfileResponseBody } from '@/lib/parse-auth-client-profile-response';
import { bootstrapTelegramAuthFromWebApp } from '@/lib/telegram-auth';
import type { AuthClientProfile } from '@/types/auth-client-profile';

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
