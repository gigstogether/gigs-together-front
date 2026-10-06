import { fetchApiJson } from '@/lib/api-core';

/**
 * Calls `POST /v1/auth/refresh` with credentials and throws when the refresh is rejected or fails.
 */
export async function postAuthRefresh(): Promise<void> {
  await fetchApiJson<void>('v1/auth/refresh', 'POST', undefined, {
    credentials: 'include',
  });
}
