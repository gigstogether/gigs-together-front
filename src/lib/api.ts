import { fetchApiJson } from '@/lib/api-core';
import type { FetchApiJsonOptions } from '@/lib/api-core';
import { fetchApiJsonWithSessionRecovery } from '@/lib/api-session-recovery';
import { logger } from '@/lib/logger';
import {
  clearStoredTelegramClientProfile,
  requestTelegramSignIn,
} from '@/lib/telegram/telegram-auth';
import { isTelegramMiniApp } from '@/lib/telegram/telegram-webapp';

export {
  ApiError,
  TELEGRAM_INIT_DATA_EXPIRED_CODE,
  isTelegramInitDataExpiredError,
} from '@/lib/api-errors';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiRequestInit = Omit<FetchApiJsonOptions, 'credentials'>;

/**
 * Authenticated / session API call. Sends cookies and runs sign-in recovery on 401.
 */
export async function apiRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: ApiRequestInit,
): Promise<TResponse> {
  try {
    const headers = new Headers(init?.headers);
    return await fetchApiJsonWithSessionRecovery<TResponse>(endpointOrUrl, method, data, {
      init: {
        ...init,
        headers,
      },
      onUnauthorized: () => {
        clearStoredTelegramClientProfile();
        if (!isTelegramMiniApp()) {
          requestTelegramSignIn();
        }
      },
    });
  } catch (e) {
    logger.errorFromUnknown('api_request_failed', e, { endpointOrUrl, method });
    throw e;
  }
}

/**
 * Public API call. Omits cookies and disables session recovery.
 * Next.js cache behavior is configured explicitly at each server call site.
 */
export async function apiPublicRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: ApiRequestInit,
): Promise<TResponse> {
  try {
    const headers = new Headers(init?.headers);
    return await fetchApiJson<TResponse>(endpointOrUrl, method, data, {
      ...init,
      headers,
      credentials: 'omit',
    });
  } catch (e) {
    logger.errorFromUnknown('api_public_request_failed', e, { endpointOrUrl, method });
    throw e;
  }
}
