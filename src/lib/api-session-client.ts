import type { FetchApiJsonOptions } from '@/lib/api-core';
import { fetchApiJsonWithSessionRecovery } from '@/lib/api-session-recovery';
import { logger } from '@/lib/logger';
import {
  clearStoredTelegramClientProfile,
  requestTelegramSignIn,
} from '@/lib/telegram/telegram-auth';
import { isTelegramMiniApp } from '@/lib/telegram/telegram-webapp';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiClientRequestInit = Omit<FetchApiJsonOptions, 'credentials'>;

/** Clears cached profile and opens sign-in UI after a final session 401. */
export function handleApiClientSessionUnauthorized(): void {
  clearStoredTelegramClientProfile();
  if (!isTelegramMiniApp()) {
    requestTelegramSignIn();
  }
}

/**
 * Client-side session API call with cookie auth, session recovery, and sign-in UI on 401.
 */
export async function apiClientRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: ApiClientRequestInit,
): Promise<TResponse> {
  try {
    const headers = new Headers(init?.headers);
    return await fetchApiJsonWithSessionRecovery<TResponse>(endpointOrUrl, method, data, {
      init: {
        ...init,
        headers,
      },
      onUnauthorized: handleApiClientSessionUnauthorized,
    });
  } catch (e) {
    logger.errorFromUnknown('api_client_request_failed', e, { endpointOrUrl, method });
    throw e;
  }
}
