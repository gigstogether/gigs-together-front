import { buildUrl } from '@/lib/api-core';

/**
 * Calls `POST /v1/auth/refresh` with credentials. Returns true if new access/refresh cookies were set.
 */
export async function postAuthRefresh(): Promise<boolean> {
  try {
    const response = await fetch(buildUrl('v1/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
